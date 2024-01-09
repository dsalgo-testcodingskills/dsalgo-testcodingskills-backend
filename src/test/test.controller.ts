import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateTestDTO,
  getallTestsubmissionsDTO,
  MultiLinkDTO,
  SaveAnswerDTO,
  shortlistedDTO,
  SubmitAnswerDTO,
  UserInfoDTO,
  updateAttributes,
} from './DTO/test.dto';
import { TestService } from './test.service';
import { AuthenticationService } from '../auth/authentication.service';
import * as moment from 'moment';
import { AuthGuard } from 'src/auth/auth.guard';
import { Types } from 'mongoose';
import { QuestionsService } from 'src/questions/question.service';
import { DIFFICULTY_LEVEL } from 'src/questions/question.types';
import * as AWS from 'aws-sdk';
import { UploadFileDto } from './DTO/uploadfile.DTO';
import { UserService } from 'src/user/user.service';

const S3 = new AWS.S3({
  region: 'us-east-2',
  signatureVersion: 'v4',
});
@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(
    private readonly testService: TestService,
    private readonly questionsService: QuestionsService,
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('create')
  async createTest(@Req() request, @Body() body: CreateTestDTO) {
    try {
      const orgId = request.payload['custom:orgId'];

      // Checking if user reached free tests limits
      const org = await this.testService.getOrganization({
        _id: orgId,
      });

      if (org && org.availableTests <= 0) {
        return {
          message: 'You have used all your tests, buy more',
          statusCode: 200,
        };
      }

      const questions = [];
      // Admin selected questions
      if (body.selectedQuestions?.length > 0) {
        let questionsSelected = [];
        body.selectedQuestions.forEach((selectedQuestion) => {
          questionsSelected.push(
            this.questionsService.getQuestion(
              new Types.ObjectId(selectedQuestion._id),
            ),
          );
        });
        questionsSelected = await Promise.all(questionsSelected);
        questionsSelected.forEach((ele) => {
          questions.push({
            id: ele._id,
            answer: [],
            question: { ...ele },
            status: 'pending',
            level: ele.level,
          });
        });
      } else {
        // Ramdom Questions
        for (const key in body.questionsTypes) {
          if (body.questionsTypes[key] == 0) {
            continue;
          }
          const randomQuestions = (
            await this.questionsService.getQuestions({
              level: key as DIFFICULTY_LEVEL,
              limit: body.questionsTypes[key],
              sampleQuestion: false,
              organizationId: orgId,
            })
          ).data;
          randomQuestions.forEach((ele) => {
            questions.push({
              id: ele._id,
              answer: [],
              question: ele,
              status: 'pending',
              level: ele.level,
            });
          });
        }
      }

      const testBody = {
        ...body,
        status: 'pending', //default value when test is created.
        questions,
        testExpiry: null,
        organisationId: new Types.ObjectId(orgId),
        ParentID: null,
        TestType: 'Single',
      };

      let testDetails = await this.testService.createTest(testBody);

      let logo = await this.authenticationService.getOrganisation(
        {
          _id: orgId,
        },
        { organizationLogo: 1 },
      );
      await this.authenticationService.updateOrganisation(
        { _id: orgId },
        { $inc: { availableTests: -1 } },
      );
      if (testDetails.emailId && body.sendMail) {
        await this.testService.sendMail(testDetails, logo);
      }

      return {
        message: 'success',
        link: `${process.env.FRONTEND_URL}/student/test/${testDetails._id}`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //////////////////////Link creater for multi user
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('MultiLinkcreate')
  async createMultiTest(@Req() request, @Body() body: MultiLinkDTO) {
    try {
      // Checking if user reached free tests limits
      const org = await this.testService.getOrganization({
        _id: request.payload['custom:orgId'],
      });
      if (org && org.availableTests <= 0) {
        return {
          message: 'You have used all your tests, buy more',
          statusCode: 200,
        };
      }
      let adminID = request.payload.nickname;

      let isadmin = await this.userService.getUser({ _id: adminID });
      if (!isadmin) {
        return 'Check Credential';
      } else {
        const questions = [];
        // Admin selected questions
        if (body.selectedQuestions?.length > 0) {
          let questionsSelected = [];
          body.selectedQuestions.forEach((selectedQuestion) => {
            questionsSelected.push(
              this.questionsService.getQuestion(
                new Types.ObjectId(selectedQuestion._id),
              ),
            );
          });
          questionsSelected = await Promise.all(questionsSelected);
          questionsSelected.forEach((ele) => {
            questions.push({
              id: ele._id,
              answer: [],
              question: { ...ele },
              status: 'pending',
              level: ele.level,
            });
          });
        } else {
          // Ramdom Questions
          questions.push();
        }
        const testBody = {
          TestType: 'MultiLink',
          ParentID: null,
          ...body,
          status: 'pending', //default value when test is created.
          questions,
          testExpiry: null,
          organisationId: new Types.ObjectId(request.payload['custom:orgId']),
          Title: body.Title,
          Description: body.Description,
        };
        let testLinkDetails = await this.testService.createTest(testBody);

        let link = `${process.env.FRONTEND_URL}/test/UserINFO/${testLinkDetails._id}`;

        return {
          message: 'success',
          link: link,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  /////////////////////////////////////////////////////////

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('resendEmail/:id')
  async resendEmail(@Param('id') testId: string, @Req() request) {
    if (!testId) {
      return false;
    }
    const test = await this.testService.getTest(testId);
    let logo = await this.authenticationService.getOrganisation(
      {
        _id: request.payload['custom:orgId'],
      },
      { organizationLogo: 1 },
    );
    await this.testService.sendMail(test, logo);
    return true;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('getalltest')
  async getAllTests(@Req() request, @Body() body: getallTestsubmissionsDTO) {
    try {
      const orgId = request.payload['custom:orgId'];
      const skip = body.page * body.limit - body.limit;

      let match: any = {
        ...body.filter,
        organisationId: new Types.ObjectId(orgId),
        ParentID: null,
      };

      const [data, count] = await this.testService.getTests(
        match,
        skip,
        body.limit,
        { createdAt: -1 },
        { questions: 0 },
      );

      return { data, count };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //Gets the TestsCount left for the organization
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('testsCount')
  async getTestsCount(@Req() request) {
    try {
      const org = await this.testService.getOrganization({
        _id: new Types.ObjectId(request.payload['custom:orgId']),
      });
      return {
        totalTests: org.availableTests,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // --------------------------- Payment routes-----------------------------------------------------

  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('JWT')
  // @Post('/payment/orders/')
  // async createOrder(@Req() request){
  //   try {
  //     const order = await this.paymentService.createOrder(request.payload.nickname);
  //     if (!order) return {message:"Some error occured while creating the order", statusCode:502}
  //     return order;
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // @Post('/payment/success/verify/')
  // async verifyPayment(@Body() body:any, @Headers('X-Razorpay-Signature') razorpaySignature:string){
  //   try {
  //     // getting the details back from razorpay webhook
  //     const result = await this.paymentService.verifyPayment(body, razorpaySignature);

  //     if(!result) return { message: "Transaction not legit!" }

  //     await this.testService.updateOrganization({_id: body.payload.payment.entity.notes.organizationId}, {$inc:{"totalTests": 1}});

  //     // THE PAYMENT IS LEGIT & VERIFIED
  //     // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
  //     //throw new BadRequestException();
  //     console.log("Code executed")
  //     return {
  //           msg: "success",
  //           statusCode: 200
  //     };

  //   } catch (error) {
  //      throw new BadRequestException(error.message);
  //   }
  // }

  // ------------------------------------------------------------------------------------------------
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('shortlist')
  async shortlist(@Body() body: shortlistedDTO) {
    const { testId, moderation } = body;

    const response = await this.testService.update(testId, {
      moderation: moderation,
    });
    return response;
  }

  //get orgLogo and name for student test page

  @Get('studentOrgDetails/:testId')
  async studentOrgDetails(@Param('testId') testId: string) {
    try {
      const testData = await this.testService.getTest(testId);

      const response = await this.authenticationService.getOrganisation(
        {
          _id: new Types.ObjectId(testData.organisationId),
        },
        { name: 1, organizationLogo: 1 },
      );
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async getTest(@Param('id') id: string, @Query('admin') isAdmin: string) {
    try {
      const test: any = await this.testService.getTest(id);

      const response = await this.authenticationService.getOrganisation(
        {
          _id: new Types.ObjectId(test.organisationId),
        },
        { availableTests: 1 },
      );

      if (response.availableTests === 0) {
        throw new BadRequestException(
          'You cannot proceed further. Contact your organisation for new test link.',
        );
      }

      if (!test) {
        throw new BadRequestException('No Test Found');
      } else if (test.startDate > moment().valueOf()) {
        //is he came before start date
        return {
          message: `Your Test is Scheduled at ${moment(test.startDate).format(
            'DD-MM-YYYY HH:mm',
          )}`,
          status: 'wait',
          test,
        };
      } else if (!isAdmin && test.isExpired) {
        // test is already expired or not and he is not admin
        return {
          message: 'Your Test is already expired',
          status: 'expired',
          test,
        };
      } else if (moment().valueOf() > test.endDate) {
        //is he came after start date
        const test = await this.testService.update(id, {
          isExpired: true,
        });

        return { message: 'your test is expired', status: 'late', test };
      } else {
        test.questions = test.questions.map((ques: any) => {
          delete ques.answer;
          delete ques.question.sampleCode;
          delete ques.question.testCases;
          return ques;
        });

        if (!isAdmin) {
          // check expiry before code and skip for admin
          const result = await this.testService.checkExpiry(id, test);
          if (result) return result;
        }
        return { message: 'Student Visited on Test Link', status: 'ok', test };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  ///Getting UserInfo for MultiLink

  @Post('UserINFO/:id')
  async getMultiTestDetails(
    @Req() request,
    @Body() body: UserInfoDTO,
    @Param('id') id: string,
  ) {
    try {
      //Confirm if ID is valid
      let testLinkConfirm: any = await this.testService.getTest(id);

      // Checking if user reached free tests limits
      const org = await this.testService.getOrganization({
        _id: testLinkConfirm.organisationId,
      });

      if (org && org.availableTests <= 0) {
        return {
          message: 'You have used all your tests, buy more',
          statusCode: 200,
        };
      }
      const newQuestion = [];
      if (testLinkConfirm) {
        if (testLinkConfirm.questions.length !== 0) {
          newQuestion.push(...testLinkConfirm.questions);
        } else {
          for (const key in testLinkConfirm.questionsTypes) {
            if (testLinkConfirm.questionsTypes[key] == 0) {
              continue;
            }
            const randomQuestions = (
              await this.questionsService.getQuestions({
                level: key as DIFFICULTY_LEVEL,
                limit: testLinkConfirm.questionsTypes[key],
                sampleQuestion: false,
                organizationId: testLinkConfirm.organisationId,
              })
            ).data;
            randomQuestions.forEach((ele) => {
              newQuestion.push({
                id: ele._id,
                answer: [],
                question: ele,
                status: 'pending',
                level: ele.level,
              });
            });
          }
        }

        let userTest = {
          isExpired: testLinkConfirm.isExpired,
          startDate: Date.now(),
          //60000ms => 1min, since test duration is in mins, we convert it in millisecs and 900000ms(15 mins)is the buffer time.
          endDate: Date.now() + testLinkConfirm.testDuration * 60000 + 900000,
          questionsTypes: testLinkConfirm.questionsTypes,
          questions: newQuestion,
          status: testLinkConfirm.status,
          emailId: body.emailId,
          studentName: body.studentName,
          testDuration: testLinkConfirm.testDuration,
          testExpiry: testLinkConfirm.testExpiry,
          organisationId: new Types.ObjectId(testLinkConfirm.organisationId),
          tags: testLinkConfirm.tags,
          ParentID: id,
          phone: body.phone,
          TestType: 'MultiLink',
          webcamStatus: testLinkConfirm.webcamStatus,
        };
        let createTest = await this.testService.createTest(userTest);
        if (!createTest) {
          return 'Test did not create';
        }

        let link = `${process.env.FRONTEND_URL}/student/test/${createTest._id}`;

        // Decreaement 1 from total tests
        await this.authenticationService.updateOrganisation(
          { _id: testLinkConfirm.organisationId },
          { $inc: { availableTests: -1 } },
        );
        return {
          message: 'Newsuccess',
          link: link,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  //////////////////Fetch Test done from multilink
  @Post('MultiLinkTestDetails/:id')
  async getUserTest(@Param('id') id: string, @Body() body: any) {
    try {
      const skip = body.page * body.limit - body.limit;
      let filter: any = {
        ...body.filter,
        ParentID: id,
      };

      let ParentTest = await this.testService.getTest(id);
      const [data, count] = await this.testService.getTests(
        filter,
        skip,
        body.limit,
        { createdAt: -1 },
        { questions: 0 },
      );

      return { ParentTest, childTest: { data, count } };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('getPresignedURL')
  async presignedURL(@Body() body: UploadFileDto) {
    try {
      return new Promise((resolve, reject) => {
        const params = {
          Bucket: 'algo-user-images',
          Fields: {
            key: body.path,
          },
          Expires: 60 * 5,
          ContentType: body.contentType,
        };

        S3.createPresignedPost(params, (err, data) => {
          if (err) {
            return reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('savePerodicAnswer')
  async saveAnswer(@Req() request, @Body() body: SaveAnswerDTO) {
    try {
      const test = await this.testService.getTest(body.testId);
      // check expiry before code
      const result = await this.testService.checkExpiry(body.testId, test);
      if (result) return result;

      const updateAnswer = {
        code: body.code,
        time: new Date(),
        language: body.language,
        imgurl: body.imgURL,
      };
      return this.testService.saveAnswer(body, updateAnswer);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('submit')
  async submitAnswer(@Req() request, @Body() body: SubmitAnswerDTO) {
    try {
      const test = await this.testService.getTest(body.testId);
      // check expiry before code
      const result = await this.testService.checkExpiry(body.testId, test);
      if (result) return result;

      const updateAnswer = {
        code: body.code,
        time: new Date(),
        language: body.language,
      };
      return this.testService.submitAnswer(body, updateAnswer);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('answer/:testId')
  async getQuestionByTest(
    @Req() request: any,
    @Param('testId') testId: any,
    @Query('questionId') questionId: any,
    @Query('admin') isAdmin: any,
  ) {
    try {
      const test: any = await this.testService.getTest(testId);
      // check expiry before code and skip for admin
      if (!isAdmin) {
        const result = await this.testService.checkExpiry(testId, test);
        if (result) return result;
      }

      // remove unselected questions
      test.questions = test.questions.filter((ques) => {
        return ques.question._id.toString() === questionId;
      });

      // signed imgUrl for admin user only
      if (isAdmin) {
        test.questions = test.questions.map((question) => {
          question.answer = question.answer.map((answer) => {
            return {
              ...answer,
              imgurl: this.testService.getPresignedUrl(answer.imgurl),
            };
          });
          return question;
        });
      }

      return test;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('started/:testId')
  async testStarted(@Param('testId') testId: string) {
    try {
      const test = await this.testService.getTest(testId);

      if (!test) {
        throw new BadRequestException('No Test Found');
      }
      //set testExpiry with test duration
      if (!test?.testExpiry) {
        const expiryTime = moment().add(test.testDuration, 'minutes');
        let updatedRes;

        if (expiryTime.diff(test.endDate) >= 0) {
          updatedRes = await this.testService.update(testId, {
            testExpiry: test.endDate.valueOf(),
          });
        } else {
          updatedRes = await this.testService.update(testId, {
            testExpiry: expiryTime.valueOf(),
          });
        }

        return { message: 'Test Started', status: 'started', updatedRes };
      }
      return { message: 'Expiry already set' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('endtest/:testId')
  async endTest(@Param('testId') testId: string) {
    try {
      const response = await this.testService.update(testId, {
        status: 'completed',
      });
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('getOrgDetails')
  async getOrgDetails(@Req() request) {
    try {
      const userInfo = await this.userService.getUser({
        _id: request.payload.nickname,
      });
      const orgDetails = await this.authenticationService.getOrganisation({
        _id: request.payload['custom:orgId'],
      });
      return {
        userInfo,
        orgDetails,
      };
    } catch (err) {
      console.log(err);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('checkUserInDB')
  async checkEmailCognito(@Req() request) {
    try {
      const data = await this.userService.getUser({
        cognitoId: request.payload.sub,
      });
      if (!data) {
        return { email: request.payload.email };
      }
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('verifyEmail')
  async verifyEmail(@Req() request) {
    try {
      if (request.payload.nickname) {
        let res = await this.userService.getUser({
          _id: request.payload.nickname,
        });
        return { user: res, status: 'LOGIN' };
      } else if (request.payload.nickname === undefined) {
        let res = await this.userService.getUser({
          emailId: request.payload.email,
          cognitoId: { $ne: request.payload.sub },
        });
        return {
          user: res,
          status: 'REGISTER',
          emailId: request.payload.email,
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('logOut')
  async logOut(@Req() request) {
    try {
      let signOut = {
        Username: request.payload.sub,
        UserPoolId: process.env.USER_POOL_ID,
      };
      return await this.testService.logOut(signOut);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
