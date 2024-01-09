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
    try{
        const question = await this.compilerService.getQuestion(body.questionId);
        const dirPath = path.join(__dirname,'compilation',body.testId,body.questionId);
        
        const isPresent = fs.existsSync(dirPath); //check if compilation path exists
    
        if (!isPresent) {
            fs.mkdirSync(dirPath,{ recursive: true });
        }
        
        const allOutputs = await this.compilerService.compileAndRun(body.language,body.code,question,dirPath);

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
    finally {
        try {
          fs.rmdir(path.join(__dirname,'compilation',body.testId),{recursive:true,maxRetries:2,retryDelay:3000},(error)=>{
            console.log(error);
          });
        } catch (err) {
        }
      }
  }
}
