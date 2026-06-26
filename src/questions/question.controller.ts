import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { getQuestionsDTO, createCustomQuestionDTO } from './DTO/question.dto';
import { QuestionsService } from './question.service';
import {
  checkTestCases,
  getDatatypeOfParamters,
  isSubscriptionExpired,
  isSuperAdmin,
} from '../common/common.functions';
import {
  CPP_SOLUTION_TEMPLATE,
  JAVA_SOLUTION_TEMPLATE,
  PYTHON_SOLUTION_TEMPLATE,
  JAVASCRIPT_SOLUTION_TEMPLATE,
  GO_SOLUTION_TEMPLATE,
  CSHARP_SOLUTION_TEMPLATE,
  TYPESCRIPT_SOLUTION_TEMPLATE,
  QUESTION_TYPE,
  LANGUAGE_CATEGORIES,
} from 'src/utils/constants';
import { AuthenticationService } from 'src/auth/authentication.service';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Post('getQuestion')
  getQuestions(@Body() body: getQuestionsDTO, @Req() request) {
    if (request?.payload && request.payload['custom:orgId']) {
      body.organizationId = new Types.ObjectId(request.payload['custom:orgId']);
    }
    return this.questionsService.getQuestions(body);
  }

  @Post('createCustomQuestion')
  @UsePipes(ValidationPipe)
  async createCustomQuestion(
    @Req() request,
    @Body() body: createCustomQuestionDTO,
  ) {
    let session = null;
    try {
      let orgId = new Types.ObjectId(request.payload['custom:orgId']);
      const isSuperAdminUser = isSuperAdmin(request);
      const org = await this.authenticationService.getOrganisation({
        _id: orgId,
      });
      
      // skip plan checks for super admin
      if (!isSuperAdminUser) {
        const subscriptionDetails = await this.questionsService.getSubsDetails(orgId);
        const activeSub = subscriptionDetails?.[0];

        if (activeSub) {
          if (isSubscriptionExpired(activeSub)) {
            return {
              message: 'Your subscription has expired, please renew to continue',
              statusCode: 402,
            };
          }
        }

      if (org && org.subscriptionPlan === 'free' && !isSuperAdminUser) {
        return {
          message: 'no custom question for free plan',
          statusCode: 402,
        };
      }
      
      if (org && org.subscriptionPlan === 'paid' && org.availableCustomQuestions <= 0) {
        return {
          message:
            'You have used all Custom Questions, upgrade your plan to create more',
          statusCode: 402,
        };
      }
      }

      //Check for each test case whether valid or not
      let isValid;
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;

      //Check for reserve Keyword in parameters

      // Generate solution templates dynamically based on questionType and available languages.
      body['solutionTemplates'] = this.questionsService.generateSolutionTemplates(body);

      body['organizationId'] = orgId;
      body['createdBy'] = request.payload.nickname;
      session = await this.questionsService.dbSession();
      await session.withTransaction(async () => {
        try {
          await this.questionsService.createCustomQuestion(body, session);

          // only decrement quota for non-super-admin users
          if (!isSuperAdminUser) {
          const updatedOrg = await this.authenticationService.updateOrganisation(
            { 
              _id: orgId, 
              subscriptionPlan: 'paid',
              availableCustomQuestions: { $gt: 0 }
            },
            { $inc: { availableCustomQuestions: -1 } },
            { session }
          );
          
          if (!updatedOrg) {
            throw new Error('Custom question limit was exhausted during creation. Race condition detected.');
          }
          }
        } catch (error) {
          throw new Error(error);
        }
      });

      return {
        message: 'Question created successfully',
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw new BadRequestException(error?.message || error);
    } finally {
      if (session) await session.endSession();
    }
  }
  
  @Post('previewCustomQuestion')
  @UsePipes(ValidationPipe)
  async previewCustomQuestion(
    @Req() request,
    @Body() body: createCustomQuestionDTO,
  ) {
    try {    
      let isValid;
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;
      body['solutionTemplates'] = this.questionsService.generateSolutionTemplates(body);

      body['organizationId'] = new Types.ObjectId(
        request.payload['custom:orgId'],
      );
      body['createdBy'] = request.payload.nickname;

      return {
        message: 'Question preview generated successfully',
        statusCode: 200,
        data: body,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('saveDraft')
  @UsePipes(ValidationPipe)
  async saveDraft(
    @Req() request,
    @Body() body: createCustomQuestionDTO,
  ) {
    try {
      let orgId = request.payload['custom:orgId'];
      const org = await this.authenticationService.getOrganisation({
        _id: request.payload['custom:orgId'],
      });
         const isSuperAdminUser = isSuperAdmin(request);
      if (org && org.subscriptionPlan === 'free' && !isSuperAdminUser) {
        return {
          message: 'no custom question for free plan',
          statusCode: 402,
        };
      }

      // Check for each test case whether valid or not
      let isValid;
      [isValid, body] = checkTestCases(body);
      if (!isValid) return body;

      body['solutionTemplates'] = this.questionsService.generateSolutionTemplates(body);

      body['organizationId'] = new Types.ObjectId(
        request.payload['custom:orgId'],
      );
      body['createdBy'] = request.payload.nickname;

      const draft = await this.questionsService.saveDraft(body);

      return {
        message: 'Draft saved successfully',
        statusCode: 200,
        data: { _id: draft._id, solutionTemplates: draft.solutionTemplates },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('finalizeDraft/:id')
  async finalizeDraft(@Param('id') id: string, @Req() request) {
    try {
      const question = await this.questionsService.findById(id);
      console.log("🚀 ~ QuestionsController ~ finalizeDraft ~ question:", question)
      if (!question) {
        throw new BadRequestException('Draft question not found');
      }
      if (!question.isDraft) {
        return {
          message: 'Question is already finalized',
          statusCode: 200,
          data: question,
        };
      }

      const result = await this.questionsService.finalizeDraft(id);

      await this.authenticationService.updateOrganisation(
        { _id: request.payload['custom:orgId'] },
        { $inc: { availableTests: -1 } },
      );

      return {
        message: 'Question created successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('/updateCustomQuestion/:id')
  async update(@Param('id') id: string, @Body() body: any, @Req() request) {
    try {
      const existingQuestion = await this.questionsService.findById(id);
      if (!existingQuestion) {
        throw new BadRequestException('Question not found');
      }

      if (String(existingQuestion.organizationId) !== request.payload['custom:orgId']) {
        throw new BadRequestException(
          'You cannot edit the question that is not added by you.',
        );
      }
      //Check for each test case whether valid or not
      let isValid;
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;

      body['solutionTemplates'] = this.questionsService.generateSolutionTemplates(body);

      const result = await this.questionsService.findAndUpdateCustomQuestion(
        id,
        body,
      );
      return {
        code: 200,
        error: null,
        message: 'Success',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('custom-question-find')
  async find(
    @Req() request,
    @Body()
    body: any,
  ) {
    const result = await this.questionsService.find(
      body,
      request.payload['custom:orgId'],
    );

    return {
      code: 200,
      error: null,
      message: 'Success',
      ...result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.questionsService.findById(id);

    return {
      code: 200,
      error: null,
      message: 'Success',
      data: result,
    };
  }
}
