import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { roleApiConfig, roleConfig } from 'src/utils/role.config';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;
    let authorizationString = '';
    if (Array.isArray(authorization)) {
      authorizationString = authorization[0];
    } else {
      authorizationString = authorization;
    }

    // request meta for endpoint authorization
    const reqMeta = {
      url: request.url,
      method: request.method,
      params: request['params'],
      body: request.body,
      headers: request.headers,
    };

    const validateTokenResponse = await this.authorizedByCognito(
      authorizationString,
      request,
      reqMeta,
    );

    if (validateTokenResponse.valid) {
      request['payload'] = validateTokenResponse.payload;
      if (
        request.url !== '/test/verifyEmail' &&
        request.url !== '/test/updateCognitoOrganization' &&
        !validateTokenResponse.payload.nickname
      ) {
        let userData = await this.userService.getUser(
          {
            sub: validateTokenResponse.payload.sub,
            emailId: validateTokenResponse.payload.email,
          },
          { _id: 1 },
        );
        request['payload'] = {
          ...validateTokenResponse.payload,
          nickname: userData._id.toString(),
        };
      }
      return true;
    }
    return false;
  }

  async authorizedByCognito(
    authHeader: string,
    request: any,
    requestMeta: any,
  ): Promise<any> {
    if (!authHeader) {
      throw new UnauthorizedException(`Authorization header is required`);
    }
    const tokenArray = authHeader.split(' ', 2);
    if (!tokenArray[0] || tokenArray[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Token type must be Bearer');
    }
    try {
      const validatedData = await this.authService.validateToken(tokenArray[1]);
      request.validatedData = validatedData.payload;
      return this.authorizationCheck(validatedData, requestMeta);
    } catch (e) {
      if (e.message === 'Session expired. Please login again.') {
        throw new HttpException(
          {
            status: 455,
            error: 'Session expired. Please login again.',
          },
          455,
        );
      } else {
        throw new UnauthorizedException(e.message);
      }
    }
  }

  authorizationCheck = async (
    validatedData: any,
    requestMeta: any,
  ): Promise<any> => {
    try {
      const role = validatedData.payload['custom:role'];
      if (['admin'].includes(role)) {
        return validatedData;
      } else if (['user'].includes(role)) {
        // will have user permissions such as {dashboard:true}
        const APIpermissions = roleConfig;

        // API which is requested
        let apiToFind = requestMeta.url;
        const methodToFind = requestMeta.method;
        const paramsList = Object.keys(requestMeta.params);
        const paramsCount = paramsList.length;

        // Check if request has any request params.. if found update api URL i.e. --> this - /widget/kdn233452jkj4kj254  to /widget/:id
        if (paramsCount) {
          paramsList.forEach((ele) => {
            apiToFind = apiToFind.replace(
              `${requestMeta.params[ele]}`.trim(),
              `:${ele}`,
            );
          });
        }

        // Get all the listed APIs array of Objects
        const allApiList = Object.values(roleApiConfig); // i.e. [{url:"/dashboard",method:"post"},...]
        const apiFoundInkeys = [];

        allApiList.forEach((apisWithAccessTypes: any, index) => {
          apisWithAccessTypes.some((el) => {
            if (
              el.url === apiToFind &&
              el.method === methodToFind.toLowerCase()
            ) {
              apiFoundInkeys.push({
                access: Object.keys(roleApiConfig)[index], // payment etc
              });
              return true;
            }
            return false;
          });
        });

        // apiFoundInkeys will be like  [{access:dashboard},{access:widget}]
        if (!apiFoundInkeys[0]) {
          throw new UnauthorizedException('not permitted');
        }

        const accessFound = apiFoundInkeys.some((key) => {
          if (APIpermissions[role] && APIpermissions[role][key.access]) {
            return true;
          }
          return false;
        });
        if (!accessFound) {
          throw new UnauthorizedException('not permitted');
        }
        return validatedData;
      } else {
        throw new UnauthorizedException('You are not allowed');
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  };
}
