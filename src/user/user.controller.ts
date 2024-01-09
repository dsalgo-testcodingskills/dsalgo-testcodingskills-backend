import {
  Controller,
  BadRequestException,
  Body,
  Post,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { TestService } from 'src/test/test.service';
import { UserService } from './user.service';
import { AuthenticationService } from 'src/auth/authentication.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserDto } from './dto/get-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { UserRoleEnum, UserStatusEnum } from 'src/common/enum';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly testService: TestService,
    private readonly authenticationService: AuthenticationService,
  ) {}
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('find-users')
  async findUsers(@Req() request: any, @Body() body: GetUserDto) {
    try {
      const { filter, page, limit } = body;
      const skip = page * limit - limit;
      filter['orgId'] = request.payload['custom:orgId'];
      const [data, count] = await this.userService.findUsers(
        filter,
        skip,
        limit,
      );
      return {
        data,
        count,
        message: 'Success',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('create-user')
  async createUser(@Req() request: any, @Body() body: CreateUserDto) {
    let session = null;
    body.password = this.userService.autoPassword() + '@';

    try {
      const { name, emailId } = body;
      const userOrgId = request.payload['custom:orgId'];
      let userData = null;

      const orgDetails = await this.authenticationService.getOrganisation({
        _id: userOrgId,
      });

      // check for user limit
      if (orgDetails?.noOfUsers <= 0) {
        throw new Error('user limit exceeded');
      }

      // added db transaction to made user creation and organisation user decrement successfull
      const session = await this.userService.dbSession();

      const transactionOptions: any = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
      };

      await session.withTransaction(async () => {
        try {
          userData = await this.userService.createUser({
            name,
            emailId,
            role: body.role,
            orgId: userOrgId,
          });

          let cognitoResp = await this.authenticationService
            .createCognitoUserbyAdmin(
              body,
              userOrgId,
              userData._id.toString(),
              body.role,
            )
            .catch(async (err) => {
              await this.userService.deleteUser(userData._id.toString());
              throw err;
            });

          await this.userService.updateUser(
            { _id: userData._id },
            {
              cognitoId: cognitoResp.userSub,
            },
          );
          let credentials = { emailId, password: body.password };
          await this.authenticationService.updateOrganisation(
            { _id: new Types.ObjectId(userOrgId) },
            { $inc: { noOfUsers: -1 } },
          );
          await this.testService.sendMailForUser(credentials);
        } catch (error) {
          throw new Error(error);
        }
      }, transactionOptions);

      return {
        data: userData,
        message: 'Success',
        link: `${process.env.FRONTEND_URL}/changePassword/${body.password}`,
      };
    } catch (error) {
      if (session) session.abortTransaction();
      throw new BadRequestException(error?.message || error);
    } finally {
      if (session) session.endSession();
    }
  }

  @Patch('update-user')
  async updateUser(@Body() body: UpdateUserDto) {
    try {
      const { id, role, status, name } = body;
      const updatedBody: any = {};
      let result = null;

      const userData = await this.userService.getUser(
        { _id: id },
        { role: 1, status: 1, emailId: 1 },
      );

      if (userData?.role !== role) {
        updatedBody.role = role;
      }

      if (userData?.status !== status) {
        updatedBody.status = status;
      }

      if (name) {
        updatedBody.name = name;
      }

      if (Object.keys(updatedBody).length !== 0) {
        result = await this.userService.updateUser(
          {
            _id: id,
          },
          updatedBody,
        );
      }

      if (updatedBody?.role) {
        await this.authenticationService.updateCognitoUser({
          emailId: userData?.emailId,
          role: updatedBody.role,
        });
      }

      if (updatedBody?.status === UserStatusEnum.INACTIVE) {
        await this.authenticationService.disableCognitoUser({
          emailId: userData?.emailId,
        });
      }

      if (updatedBody?.status === UserStatusEnum.ACTIVE) {
        await this.authenticationService.enableCognitoUser({
          emailId: userData?.emailId,
        });
      }

      return { data: result, message: 'Success' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('change-password')
  async updatePassword(@Body() body: ChangePasswordDto) {
    try {
      let result = await this.authenticationService.changeNewUserPassword(body);

      return { data: result, message: 'Success' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('organisation')
  async updateOrganisation(
    @Req() request: any,
    @Body() body: UpdateOrganisationDto,
  ) {
    try {
      const userRole = request.payload['custom:role'];
      const userOrgId = request.payload['custom:orgId'];

      if (userRole !== UserRoleEnum.ADMIN) {
        return { message: 'Unauthorized role access' };
      }

      const updateQuery = {};
      if (body.organizationLogo) {
        updateQuery['organizationLogo'] = body.organizationLogo;
      }
      if (body.organizationName) {
        updateQuery['name'] = body.organizationName;
      }

      const result = await this.authenticationService.updateOrganisation(
        { _id: new Types.ObjectId(userOrgId) },
        updateQuery,
      );

      return {
        data: result,
        message: 'Success',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
