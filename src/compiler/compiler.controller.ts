import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {Model} from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { CompilerService } from './compiler.service';
import { CompileCodeDTO } from './DTO/compiler.dto';
import { TestDocument } from 'src/test/SCHEMA/test.schema';
@ApiTags('compiler')
@Controller('compiler')
export class CompilerController {
  constructor(
      @InjectModel('tests')
      private readonly testsModel: Model<TestDocument>,
      private readonly compilerService: CompilerService
  ) {}

  @Get('questions')
  getQuestionsList() {
    return this.compilerService.getQuestions();
  }

  @Get('questionDetails/:id')
  getQuestionDetails(@Param('id') id: number) {
    return this.compilerService.getQuestion(id);
  }

  @Post('compileCode')
  async compile(@Req() request, @Body() body: CompileCodeDTO) {
    try {
      let questionData: any = null;
      
      if (body.testCases && body.testCases.length > 0) {
        questionData = {
          testCases: body.testCases,
          inputType: body.inputType || [],
          outputType: body.outputType,
          constraints: body.constraints,
          outputConstraints: body.outputConstraints,
          questionType: body.questionType,
          _id: body.questionId,
        };
      } else {
        questionData = await this.compilerService.getQuestion(body.questionId);
      }

      if (!questionData) {
        throw new Error('Question data not found. Please provide testId and questionId or full metadata.');
      }

      const allOutputs = await this.compilerService.compileAndRun(
        body.language,
        body.code,
        questionData,
      );

      return allOutputs;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.EXPECTATION_FAILED,
          message: error.message || error,
        },
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
}
