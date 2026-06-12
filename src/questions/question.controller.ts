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
  generateSolutionTemplates,
} from '../common/common.functions';
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
  getQuestions(@Body() body: getQuestionsDTO) {
    return this.questionsService.getQuestions(body);
  }

  @Post('createCustomQuestion')
  @UsePipes(ValidationPipe)
  async createCustomQuestion(
    @Req() request,
    @Body() body: createCustomQuestionDTO,
  ) {
    try {
      let orgId = request.payload['custom:orgId'];
      const org = await this.authenticationService.getOrganisation({
        _id: request.payload['custom:orgId'],
      });
      if (org && org.subscriptionPlan === 'free') {
        return {
          message: 'no custom question for free plan',
          statusCode: 402,
        };
      }
      let custQuestionCount = await this.questionsService.customQuestionCount({
        organizationId: orgId,
      });

      if (
        custQuestionCount === org.availableTests &&
        org.subscriptionPlan === 'paid'
      )
        return {
          message:
            'You have used all Custom Questions, upgrade your plan to create more',
          statusCode: 402,
        };

      //Check for each test case whether valid or not
      let isValid;
      console.log(body);
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;

      //Check for reserve Keyword in parameters

      // Generate solution templates for all supported languages.
      body['solutionTemplates'] = generateSolutionTemplates(body.inputType, body.outputType);

      body['organizationId'] = new Types.ObjectId(
        request.payload['custom:orgId'],
      );
      body['createdBy'] = request.payload.nickname;
      await this.questionsService.createCustomQuestion(body);

      await this.authenticationService.updateOrganisation(
        { _id: request.payload['custom:orgId'] },
        { $inc: { availableTests: -1 } },
      );

      return {
        message: 'Question created successfully',
        statusCode: 200,
        data: null,
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
      if (org && org.subscriptionPlan === 'free') {
        return {
          message: 'no custom question for free plan',
          statusCode: 402,
        };
      }

      // Check for each test case whether valid or not
      let isValid;
      [isValid, body] = checkTestCases(body);
      if (!isValid) return body;

      // Generate solution templates for all supported languages.
      body['solutionTemplates'] = generateSolutionTemplates(body.inputType, body.outputType);

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
      if (
        request.payload.organizationId !== body.organizationId &&
        body.public === true
      ) {
        throw new BadRequestException(
          'You cannot edit the public question that is not added by you.',
        );
      }
      //Check for each test case whether valid or not
      let isValid;
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;

      // Generate solution templates for all supported languages.
      body['solutionTemplates'] = generateSolutionTemplates(body.inputType, body.outputType);

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
