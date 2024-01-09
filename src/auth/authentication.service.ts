import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Model } from 'mongoose';
import {
  authenticationdata,
  changePassword,
  confirmForgotPasswordDTO,
  forgotPasswordDTO,
  registerDTO,
  resendVerificationCodeDTO,
  verificationCodeDTO,
} from './DTO/auth.dto';
import { OrganizationDocument } from './schema/organization.schema';
import * as axios from 'axios';
import * as jwkToPem from 'jwk-to-pem';
import * as jwt from 'jsonwebtoken';
import * as AWS from 'aws-sdk';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

@Injectable()
export class AuthenticationService {
  private userPool: CognitoUserPool;
  private validateTokenURL = '';
  private cognitoTokenSignatureRes;
  private cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;

  constructor(
    @InjectModel('organizations')
    private readonly orgModel: Model<OrganizationDocument>,
  ) {
    this.initializeUserPool();

    this.cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider({
        region: process.env.AWS_REGION,
      });
  }

  initializeUserPool() {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.USER_POOL_ID,
      ClientId: process.env.CLIENT_ID,
    });
    this.validateTokenURL = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`;
  }

  async createCognitoUser(
    body: Partial<registerDTO>,
    organisationId: string,
    userId: string,
    role: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const { emailId, password } = body;

        const attributeList = [];

        const nickname = {
          Name: 'nickname',
          Value: userId,
        };

        const orgId = {
          Name: 'custom:orgId',
          Value: organisationId,
        };

        const userRole = {
          Name: 'custom:role',
          Value: role,
        };

        const attributeOrgname = new CognitoUserAttribute(nickname);
        const attributeName = new CognitoUserAttribute(orgId);
        const attributeRole = new CognitoUserAttribute(userRole);

        attributeList.push(attributeOrgname);
        attributeList.push(attributeName);
        attributeList.push(attributeRole);

        this.userPool.signUp(
          emailId,
          password,
          attributeList,
          null,
          function (err, result) {
            if (err) {
              reject(err);
            }
            resolve(result);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async createCognitoUserbyAdmin(
    body: Partial<CreateUserDto>,
    organisationId: string,
    userId: string,
    role: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const { emailId, password } = body;
        const params = {
          UserPoolId: process.env.USER_POOL_ID,
          Username: emailId,

          MessageAction: 'SUPPRESS',
          // DesiredDeliveryMediums: ['EMAIL'],
          ForceAliasCreation: false,
          TemporaryPassword: password,

          UserAttributes: [
            { Name: 'custom:orgId', Value: organisationId },

            { Name: 'custom:role', Value: role },
            { Name: 'nickname', Value: userId },
          ],
        };

        this.cognitoIdentityServiceProvider.adminCreateUser(
          params,
          async (err, data) => {
            if (err) {
              // an error occurred
              return reject(err);
            }

            return resolve(data);
            // successful response
          },
        );
      } catch (error) {
        throw new Error(error.message);
      }
    });
  }

  changeNewUserPassword(user: {
    emailId: string;
    oldPassword: string;
    newPassword: string;
  }) {
    const { emailId, oldPassword, newPassword } = user;

    const authenticationDetails = new AuthenticationDetails({
      Username: emailId,
      Password: oldPassword,
    });

    const userData = {
      Username: emailId,
      Pool: this.userPool,
    };

    const newUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {

          return newUser.changePassword(
            oldPassword,
            newPassword,
            (err, success) => {
              if (err) {
                reject(err);
              }
              resolve(success);
            },
          );
        },

        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {

          newUser.completeNewPasswordChallenge(
            newPassword,
            {},
            {
              onSuccess: async (res) => {
                return resolve(res);
              },
              onFailure: (error) => {
                return reject(error);
              },
            },
          );
        },
      });
    });
  }

  async verifyCode(@Body() body: verificationCodeDTO): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId, verificationCode } = body;

        const userData = {
          Username: emailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.confirmRegistration(
          verificationCode,
          true,
          function (err, result) {
            if (err) {
              reject(err.message);
            }
            resolve(result);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async resendVerifyCode(
    @Body() body: resendVerificationCodeDTO,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = body;

        const userData = {
          Username: emailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.resendConfirmationCode(function (err, result) {
          if (err) {
            reject(err.message);
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async authenticateUser(@Body() body: authenticationdata): Promise<any> {
    const { emailId, password } = body;

    const authenticationDetails = new AuthenticationDetails({
      Username: emailId,
      Password: password,
    });

    const userData = {
      Username: emailId,
      Pool: this.userPool,
    };

    const newUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async ConfirmUserSession(@Body() body): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { accessToken, idToken, refreshToken, email } = body;
        const AccessToken = new CognitoAccessToken({
          AccessToken: accessToken,
        });
        const IdToken = new CognitoIdToken({ IdToken: idToken });
        const RefreshToken = new CognitoRefreshToken({
          RefreshToken: refreshToken,
        });

        const sessionData = {
          IdToken: IdToken,
          AccessToken: AccessToken,
          RefreshToken: RefreshToken,
        };
        const userSession = new CognitoUserSession(sessionData);

        const userData = {
          Username: email,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.setSignInUserSession(userSession);

        cognitoUser.getSession(function (err, session) {
          // You must run this to verify that session (internally)
          if (session.isValid()) {
            // Update attributes or whatever else you want to do
            const result = { message: 'session is valid' };
            resolve(result);
          } else {
            // TODO: What to do if session is invalid?
            const result = { message: 'session is not valid' };
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async changePassword(@Body() body: changePassword): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId, newPassword, oldPassword } = body;

        const userData = {
          Username: emailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.changePassword(
          oldPassword,
          newPassword,
          function (err, result) {
            if (err) {
              reject(err.message);
            }
            resolve(result);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async forgotPassword(@Body() body: forgotPasswordDTO) {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = body;
        const userData = {
          Username: emailId,
          Pool: this.userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.forgotPassword({
          onSuccess: (data) => {
            resolve(data);
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async confirmForgotPassword(
    @Body()
    body: confirmForgotPasswordDTO,
  ) {
    return new Promise((resolve, reject) => {
      const { emailId, verificationCode, newPassword } = body;
      const userData = {
        Username: emailId,
        Pool: this.userPool,
      };

      const cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async validateToken(token: string): Promise<any> {
    /* 
      Test Caching of Cognito Keys ----> START
      ! IN TESTING MODE
    */
    let response = this.cognitoTokenSignatureRes;
    if (!response) {
      response = await axios.default.get(this.validateTokenURL);
      this.cognitoTokenSignatureRes =
        response && response.status === 200 && response.data
          ? response
          : undefined;
    }
    /* 
        Test Caching of Cognito Keys ----> END
      */

    if (response && response.status === 200 && response.data) {
      try {
        return new Promise((resolve, reject) => {
          const pems = {};
          const keys = response.data['keys'];
          for (let i = 0; i < keys.length; i++) {
            const key_id = keys[i].kid;
            const modulus = keys[i].n;
            const exponent = keys[i].e;
            const key_type = keys[i].kty;
            const jwk = { kty: key_type, n: modulus, e: exponent };
            const pem = jwkToPem(jwk);
            pems[key_id] = pem;
          }
          const decodedJwt = jwt.decode(token, { complete: true });
          if (!decodedJwt) {
            reject('Session expired. Please login again.');
          }

          const kid = decodedJwt['header'].kid;
          const pem = pems[kid];
          if (!pem) {
            reject(new Error('Unknown token'));
          }

          jwt.verify(token, pem, (err, payload) => {
            if (err) {
              reject(new Error('Session expired. Please login again.'));
            } else {
              resolve({ valid: true, payload });
            }
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    } else {
      throw new Error('Somethings Wrong');
    }
  }

  async deleteCognitoUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = data;
        const params: CognitoIdentityServiceProvider.AdminEnableUserRequest = {
          Username: emailId,
          UserPoolId: this.userPool.getUserPoolId(),
        };

        this.cognitoIdentityServiceProvider.adminDeleteUser(
          params,
          (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async disableCognitoUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = data;
        const params: CognitoIdentityServiceProvider.AdminEnableUserRequest = {
          Username: emailId,
          UserPoolId: this.userPool.getUserPoolId(),
        };

        this.cognitoIdentityServiceProvider.adminDisableUser(
          params,
          (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async enableCognitoUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId } = data;
        const params: CognitoIdentityServiceProvider.AdminEnableUserRequest = {
          Username: emailId,
          UserPoolId: this.userPool.getUserPoolId(),
        };

        this.cognitoIdentityServiceProvider.adminEnableUser(
          params,
          (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateCognitoUser(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const { emailId, role } = data;
        const params: CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest =
          {
            Username: emailId,
            UserPoolId: this.userPool.getUserPoolId(),
            UserAttributes: [],
          };

        if (role) {
          params.UserAttributes.push({ Name: 'custom:role', Value: role });
        }

        this.cognitoIdentityServiceProvider.adminUpdateUserAttributes(
          params,
          (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  createOrganisation(body) {
    return this.orgModel.create(body);
  }

  updateOrganisation(filter, updateBody, options = {}) {
    return this.orgModel.findOneAndUpdate(filter, updateBody, options);
  }

  getOrganisation(filter, project = {}) {
    return this.orgModel.findOne(filter, project).lean();
  }

  deleteOrganisation(id) {
    return this.orgModel.findByIdAndDelete(id);
  }
}
