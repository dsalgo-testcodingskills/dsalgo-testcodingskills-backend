import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  authenticationdata,
  changePassword,
  confirmForgotPasswordDTO,
  registerDTO,
  forgotPasswordDTO,
  resendVerificationCodeDTO,
  verificationCodeDTO,
} from './DTO/auth.dto';
import { AuthenticationService } from './authentication.service';
import { UserService } from 'src/user/user.service';
import { UserRoleEnum } from 'src/common/enum';
import { roleConfig } from 'src/utils/role.config';

@ApiTags('Authentication-cognito')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() body: registerDTO) {
    try {
      const { organizationName, name, emailId } = body;

      const user = await this.userService.createUser({
        name,
        emailId,
        role: UserRoleEnum.ADMIN,
        temporaryPasswordChanged: true,
      });

      const org = await this.authenticationService.createOrganisation({
        name: organizationName,
        createdBy: user._id.toString(),
        availableTests: 20,
        noOfUsers: 2, // including organization creator
        subscriptionPlan: 'free',
      });

      let cognitoResp = await this.authenticationService
        .createCognitoUser(
          body,
          org._id.toString(),
          user._id.toString(),
          UserRoleEnum.ADMIN,
        )
        .catch(async (err) => {
          await this.authenticationService.deleteOrganisation(
            org._id.toString(),
          );
          await this.userService.deleteUser(user._id.toString());
          throw err;
        });

      await this.userService.updateUser(
        { _id: user._id },
        {
          cognitoId: cognitoResp.userSub,
          orgId: org._id.toString(),
        },
      );

      return { data: user, message: 'Success' };
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @Post('verifyCode')
  async verifyCode(@Body() body: verificationCodeDTO) {
    try {
      await this.authenticationService.verifyCode(body);
      return { message: 'Success' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('resendVerifyCode')
  async resendVerifyCode(@Body() body: resendVerificationCodeDTO) {
    try {
      return await this.authenticationService.resendVerifyCode(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('authenticateUser')
  async authenticateUser(@Body() body: authenticationdata) {
    try {
      const result = await this.authenticationService.authenticateUser(body);

      // fetch user permissions via role from role config
      const role = result?.idToken?.payload['custom:role'] || null;
      if (role) result.permissions = roleConfig[role];

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('CofirmUserSession')
  async confirmSession(@Body() body: any) {
    try {
      return await this.authenticationService.ConfirmUserSession(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('changePassword')
  async changePassword(@Body() body: changePassword) {
    try {
      return await this.authenticationService.changePassword(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() body: forgotPasswordDTO) {
    try {
      return this.authenticationService.forgotPassword(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('confirmForgotPassword')
  async confirmForgotPassword(
    @Body()
    body: confirmForgotPasswordDTO,
  ) {
    try {
      return this.authenticationService.confirmForgotPassword(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
