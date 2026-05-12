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
      let orgId = request.payload['custom:orgId'];
      const isSuperAdminUser = isSuperAdmin(request);
      const org = await this.authenticationService.getOrganisation({
        _id: orgId,
      });
      
      // skip plan checks for super admin
      if (!isSuperAdminUser) {
        const subscriptionDetails = await this.questionsService.getSubsDetails(orgId);
        const activeSub = subscriptionDetails?.[0];

        if (activeSub) {
          const currentUnix = Math.floor(Date.now() / 1000);
          if (activeSub.status === 'active' && activeSub.end_at < currentUnix) {
            return {
              message: 'Your subscription has expired, please renew to continue',
              statusCode: 402,
            };
          }
        }

      if (org && org.subscriptionPlan === 'free') {
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
      console.log(body);
      [isValid, body] = checkTestCases(body);

      if (!isValid) return body;

      //Check for reserve Keyword in parameters

      //Generate solution templates for each language.
      //Create parameter string for each language to be inserted in solution template.
      let cpp_solution_params = '';
      let java_solution_params = '';
      let python_javascript_solution_params = '';
      let go_solution_params = '';
      let csharp_solution_params = '';
      let typescript_solution_params = '';
      for (const param of body.inputType) {
        cpp_solution_params =
          cpp_solution_params +
          getDatatypeOfParamters('cpp', param.type) +
          ' ' +
          param.paramName +
          ',';
        java_solution_params =
          java_solution_params +
          getDatatypeOfParamters('java', param.type) +
          ' ' +
          param.paramName +
          ',';
        python_javascript_solution_params =
          python_javascript_solution_params + param.paramName + ',';

        go_solution_params =
          param.paramName +
          ' ' +
          getDatatypeOfParamters('go', param.type) +
          ',';
          
        csharp_solution_params =
          csharp_solution_params +
          getDatatypeOfParamters('csharp', param.type) +
          ' ' +
          param.paramName +
          ',';
          
        typescript_solution_params =
          typescript_solution_params +
          param.paramName +
          ': ' +
          getDatatypeOfParamters('typescript', param.type) +
          ',';
      }
      //Remove comma from end of string
      cpp_solution_params = cpp_solution_params.replace(/,$/g, '');
      java_solution_params = java_solution_params.replace(/,$/g, '');
      python_javascript_solution_params =
        python_javascript_solution_params.replace(/,$/g, '');
      go_solution_params = go_solution_params.replace(/.$/g, '');
      csharp_solution_params = csharp_solution_params.replace(/,$/g, '');
      typescript_solution_params = typescript_solution_params.replace(/,$/g, '');

      //Replacing return type with outputType and parameters with generated params, inside the solution template.
      body['solutionTemplates'] = [
        {
          language: 'cpp',
          code: CPP_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('cpp', body.outputType),
          ).replace('parameters', cpp_solution_params),
        },
        {
          language: 'java',
          code: JAVA_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('java', body.outputType),
          ).replace('parameters', java_solution_params),
        },
        {
          language: 'python',
          code: PYTHON_SOLUTION_TEMPLATE.replace(
            'parameters',
            python_javascript_solution_params,
          ),
        },
        {
          language: 'javascript',
          code: JAVASCRIPT_SOLUTION_TEMPLATE.replace(
            'parameters',
            python_javascript_solution_params,
          ),
        },
        {
          language: 'go',
          code: GO_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('go', body.outputType),
          ).replace('parameters', go_solution_params),
        },
        {
          language: 'csharp',
          code: CSHARP_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('csharp', body.outputType),
          ).replace('parameters', csharp_solution_params),
        },
        {
          language: 'typescript',
          code: TYPESCRIPT_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('typescript', body.outputType),
          ).replace('parameters', typescript_solution_params),
        },
      ];

      body['organizationId'] = new Types.ObjectId(orgId);
      body['createdBy'] = request.payload.nickname;
      session = await this.questionsService.dbSession();
      await session.withTransaction(async () => {
        try {
          await this.questionsService.createCustomQuestion(body, session);

          // only decrement quota for non-super-admin users
          if (!isSuperAdminUser) {
          const updatedOrg = await this.authenticationService.updateOrganisation(
            { 
              _id: new Types.ObjectId(orgId), 
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
      let cpp_solution_params = '';
      let java_solution_params = '';
      let python_javascript_solution_params = '';
      let go_solution_params = '';
      let csharp_solution_params = '';
      let typescript_solution_params = '';
      for (const param of body.inputType) {
        cpp_solution_params =
          cpp_solution_params +
          getDatatypeOfParamters('cpp', param.type) +
          ' ' +
          param.paramName +
          ',';
        java_solution_params =
          java_solution_params +
          getDatatypeOfParamters('java', param.type) +
          ' ' +
          param.paramName +
          ',';
        python_javascript_solution_params =
          python_javascript_solution_params + param.paramName + ',';

        go_solution_params =
          param.paramName +
          ' ' +
          getDatatypeOfParamters('go', param.type) +
          ',';

        csharp_solution_params =
          csharp_solution_params +
          getDatatypeOfParamters('csharp', param.type) +
          ' ' +
          param.paramName +
          ',';

        typescript_solution_params =
          typescript_solution_params +
          param.paramName +
          ': ' +
          getDatatypeOfParamters('typescript', param.type) +
          ',';
      }
      cpp_solution_params = cpp_solution_params.replace(/,$/g, '');
      java_solution_params = java_solution_params.replace(/,$/g, '');
      python_javascript_solution_params =
        python_javascript_solution_params.replace(/,$/g, '');
      go_solution_params = go_solution_params.replace(/.$/g, '');
      csharp_solution_params = csharp_solution_params.replace(/,$/g, '');
      typescript_solution_params = typescript_solution_params.replace(/,$/g, '');


      body['solutionTemplates'] = [
        {
          language: 'cpp',
          code: CPP_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('cpp', body.outputType),
          ).replace('parameters', cpp_solution_params),
        },
        {
          language: 'java',
          code: JAVA_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('java', body.outputType),
          ).replace('parameters', java_solution_params),
        },
        {
          language: 'python',
          code: PYTHON_SOLUTION_TEMPLATE.replace(
            'parameters',
            python_javascript_solution_params,
          ),
        },
        {
          language: 'javascript',
          code: JAVASCRIPT_SOLUTION_TEMPLATE.replace(
            'parameters',
            python_javascript_solution_params,
          ),
        },
        {
          language: 'go',
          code: GO_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('go', body.outputType),
          ).replace('parameters', go_solution_params),
        },
        {
          language: 'csharp',
          code: CSHARP_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('csharp', body.outputType),
          ).replace('parameters', csharp_solution_params),
        },
        {
          language: 'typescript',
          code: TYPESCRIPT_SOLUTION_TEMPLATE.replace(
            'return_type',
            getDatatypeOfParamters('typescript', body.outputType),
          ).replace('parameters', typescript_solution_params),
        },
      ];

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
