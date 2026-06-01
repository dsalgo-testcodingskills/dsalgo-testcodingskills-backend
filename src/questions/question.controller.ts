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
import {
  getQuestionsDTO,
  createCustomQuestionDTO,
  validateReferenceSolutionDTO,
  publishQuestionDTO,
} from './DTO/question.dto';
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
} from 'src/utils/constants';
import { AuthenticationService } from 'src/auth/authentication.service';
import { CompilerService } from 'src/compiler/compiler.service';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly authenticationService: AuthenticationService,
    private readonly compilerService: CompilerService,
  ) {}

  private generateSolutionTemplates(inputType: any[], outputType: string) {
    let cpp_params = '';
    let java_params = '';
    let py_js_params = '';
    let go_params = '';
    let csharp_params = '';
    let ts_params = '';

    for (const param of inputType) {
      cpp_params    += `${getDatatypeOfParamters('cpp', param.type)} ${param.paramName},`;
      java_params   += `${getDatatypeOfParamters('java', param.type)} ${param.paramName},`;
      py_js_params  += `${param.paramName},`;
      go_params      = `${param.paramName} ${getDatatypeOfParamters('go', param.type)},`;
      csharp_params += `${getDatatypeOfParamters('csharp', param.type)} ${param.paramName},`;
      ts_params     += `${param.paramName}: ${getDatatypeOfParamters('typescript', param.type)},`;
    }

    // Remove trailing commas
    cpp_params    = cpp_params.replace(/,$/g, '');
    java_params   = java_params.replace(/,$/g, '');
    py_js_params  = py_js_params.replace(/,$/g, '');
    go_params     = go_params.replace(/.$/g, '');
    csharp_params = csharp_params.replace(/,$/g, '');
    ts_params     = ts_params.replace(/,$/g, '');

    return [
      {
        language: 'cpp',
        code: CPP_SOLUTION_TEMPLATE
          .replace('return_type', getDatatypeOfParamters('cpp', outputType))
          .replace('parameters', cpp_params),
      },
      {
        language: 'java',
        code: JAVA_SOLUTION_TEMPLATE
          .replace('return_type', getDatatypeOfParamters('java', outputType))
          .replace('parameters', java_params),
      },
      {
        language: 'python',
        code: PYTHON_SOLUTION_TEMPLATE.replace('parameters', py_js_params),
      },
      {
        language: 'javascript',
        code: JAVASCRIPT_SOLUTION_TEMPLATE.replace('parameters', py_js_params),
      },
      {
        language: 'go',
        code: GO_SOLUTION_TEMPLATE
          .replace('return_type', getDatatypeOfParamters('go', outputType))
          .replace('parameters', go_params),
      },
      {
        language: 'csharp',
        code: CSHARP_SOLUTION_TEMPLATE
          .replace('return_type', getDatatypeOfParamters('csharp', outputType))
          .replace('parameters', csharp_params),
      },
      {
        language: 'typescript',
        code: TYPESCRIPT_SOLUTION_TEMPLATE
          .replace('return_type', getDatatypeOfParamters('typescript', outputType))
          .replace('parameters', ts_params),
      },
    ];
  }

  private async checkSubscription(orgId: Types.ObjectId, isSuperAdminUser: boolean, org: any) {
    if (isSuperAdminUser) return null; // super admin bypasses all checks

    const subscriptionDetails = await this.questionsService.getSubsDetails(orgId);
    const activeSub = subscriptionDetails?.[0];

    if (activeSub && isSubscriptionExpired(activeSub)) {
      return {
        message: 'Your subscription has expired, please renew to continue',
        statusCode: 402,
      };
    }

    if (org?.subscriptionPlan === 'free') {
      return {
        message: 'No custom questions allowed on free plan',
        statusCode: 402,
      };
    }

    if (org?.subscriptionPlan === 'paid' && org.availableCustomQuestions <= 0) {
      return {
        message: 'You have used all custom questions, upgrade your plan to create more',
        statusCode: 402,
      };
    }

    return null; // all checks passed
  }

  @Post('getQuestion')
  getQuestions(@Body() body: getQuestionsDTO, @Req() request) {
    if (request?.payload && request.payload['custom:orgId']) {
      body.organizationId = new Types.ObjectId(request.payload['custom:orgId']);
    }
    return this.questionsService.getQuestions(body);
  }

  // Questions are now saved as 'draft' by default.
  // Admin must call validateReferenceSolution -> publishQuestion to make
  // the question available for tests.
  @Post('createCustomQuestion')
  @UsePipes(ValidationPipe)
  async createCustomQuestion(
    @Req() request,
    @Body() body: createCustomQuestionDTO,
  ) {
    let session = null;
    try {
      const orgId = new Types.ObjectId(request.payload['custom:orgId']);
      const isSuperAdminUser = isSuperAdmin(request);
      const org = await this.authenticationService.getOrganisation({ _id: orgId });
      const subscriptionError = await this.checkSubscription(orgId, isSuperAdminUser, org);
      if (subscriptionError) return subscriptionError;

      let isValid;
      [isValid, body] = checkTestCases(body);
      if (!isValid) return body;

      // Generate solution templates
      body['solutionTemplates'] = this.generateSolutionTemplates(body.inputType, body.outputType);
      // Always start as draft — must be verified before publishing
      body['status'] = 'draft';
      body['organizationId'] = orgId;
      body['createdBy'] = request.payload.nickname;
      session = await this.questionsService.dbSession();
      await session.withTransaction(async () => {
        try {
          await this.questionsService.createCustomQuestion(body, session);

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
        message: 'Question saved as draft. Add a reference solution to publish it.',
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

      body['solutionTemplates'] = this.generateSolutionTemplates(body.inputType, body.outputType);
      body['organizationId'] = new Types.ObjectId(request.payload['custom:orgId']);
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

  // admin writes a solution and submits it here.
  // We run it against ALL test cases (manual + edge + stress) via Judge0.
  // If all pass -> saves reference solution on question.
  // If any fail -> returns which test cases failed so admin can fix them.
  // Admin then calls publishQuestion to make it live.
  @Post('validateReferenceSolution')
  @UsePipes(ValidationPipe)
  async validateReferenceSolution(
    @Req() request,
    @Body() body: validateReferenceSolutionDTO,
  ) {
    try {
      const question = await this.questionsService.findById(body.questionId);

      if (!question) {
        throw new BadRequestException('Question not found');
      }

      if (String(question.organizationId) !== request.payload['custom:orgId']) {
        throw new BadRequestException('You do not have permission to validate this question');
      }

      if (question.status === 'published') {
        throw new BadRequestException('Question is already published');
      }

      const results = await this.compilerService.compileAndRun(
        body.referenceSolution.language as any,
        body.referenceSolution.code,
        question,
        '', // dirPath no longer needed after Judge0 integration
      );

      const allPassed = results.every((r: any) => r.result === true);
      const failedCases = results
        .map((r: any, i: number) => ({ ...r, index: i }))
        .filter((r: any) => r.result === false);

      if (!allPassed) {
        return {
          message: 'Reference solution failed some test cases. Please fix before publishing.',
          statusCode: 400,
          data: {
            totalTestCases: results.length,
            passed: results.length - failedCases.length,
            failed: failedCases.length,
            failedCases: failedCases.map((f) => ({
              index: f.index,
              logs: f.logs,
              actualOutput: f.actualOutput,
              // only show input for non-hidden test cases
              input: question.testCases[f.index]?.hidden
                ? '[hidden]'
                : question.testCases[f.index]?.input,
            })),
          },
        };
      }

      await this.questionsService.findAndUpdateCustomQuestion(body.questionId, {
        referenceSolution: body.referenceSolution,
      });

      return {
        message: 'Reference solution verified successfully. You can now publish the question.',
        statusCode: 200,
        data: {
          totalTestCases: results.length,
          passed: results.length,
          failed: 0,
          // return time/memory stats so admin can fine-tune constraints
          executionStats: results.map((r: any, i: number) => ({
            testCase: i + 1,
            time: r.time,
            memory: r.memory,
          })),
        },
      };
    } catch (error) {
      throw new BadRequestException(error?.message || error);
    }
  }

  // after reference solution is verified.
  // Published questions become available for tests.
  @Post('publishQuestion')
  @UsePipes(ValidationPipe)
  async publishQuestion(
    @Req() request,
    @Body() body: publishQuestionDTO,
  ) {
    try {
      const question = await this.questionsService.findById(body.questionId);

      if (!question) {
        throw new BadRequestException('Question not found');
      }

      if (String(question.organizationId) !== request.payload['custom:orgId']) {
        throw new BadRequestException('You do not have permission to publish this question');
      }

      if (!question.referenceSolution) {
        throw new BadRequestException(
          'Please verify a reference solution before publishing. Call validateReferenceSolution first.',
        );
      }

      if (question.status === 'published') {
        throw new BadRequestException('Question is already published');
      }

      await this.questionsService.findAndUpdateCustomQuestion(body.questionId, {
        status: 'published',
      });

      return {
        message: 'Question published successfully',
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      throw new BadRequestException(error?.message || error);
    }
  }

  // When a published question is edited, it goes back to draft
  // so admin must re-verify reference solution before re-publishing.
  // this prevents broken questions from going live after edits.
  @Patch('/updateCustomQuestion/:id')
  async update(@Param('id') id: string, @Body() body: any, @Req() request) {
    try {
      const existingQuestion = await this.questionsService.findById(id);
      if (!existingQuestion) {
        throw new BadRequestException('Question not found');
      }

      if (String(existingQuestion.organizationId) !== request.payload['custom:orgId']) {
        throw new BadRequestException('You cannot edit a question that was not created by your organization');
      }

      let isValid;
      [isValid, body] = checkTestCases(body);
      if (!isValid) return body;

      // reset to draft on edit — must re-verify before publishing again
      body['status'] = 'draft';
      body['referenceSolution'] = null; // clear old reference solution

      const result = await this.questionsService.findAndUpdateCustomQuestion(id, body);

      return {
        code: 200,
        error: null,
        message: 'Question updated and moved back to draft. Please re-verify before publishing.',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('custom-question-find')
  async find(@Req() request, @Body() body: any) {
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
