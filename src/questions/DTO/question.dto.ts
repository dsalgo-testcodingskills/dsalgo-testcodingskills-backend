import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { QUESTION_INPUT_TYPE, QUESTION_OUTPUT_TYPE } from 'src/utils/constants';
import { DIFFICULTY_LEVEL, testCase } from '../question.types';

export interface CustomQuestionTestCase {
  hidden: boolean;
  input: string;
  output: string;
}

export class createQuestionDTO {
  organizationId: Types.ObjectId; // will be retrieved from token

  createdBy: string; //will be retrieved from token

  @ApiProperty({ required: true })
  @IsNotEmpty()
  level: DIFFICULTY_LEVEL;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  question: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sampleQuestion: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  testCases: testCase[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  public: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  inputType: QUESTION_INPUT_TYPE;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  outputType: QUESTION_OUTPUT_TYPE;
}

export class getQuestionsDTO {
  @ApiProperty({ required: false })
  public?: boolean;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  questionId?: string;

  @ApiProperty({ required: false })
  sampleQuestion?: boolean;

  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  level?: DIFFICULTY_LEVEL;

  organizationId: Types.ObjectId; // will be retrieved from token
}

export class createCustomQuestionDTO {
  organizationId: Types.ObjectId; // will be retrieved from token

  createdBy: string; //will be retrieved from token

  @ApiProperty({ required: true })
  @IsNotEmpty()
  level: DIFFICULTY_LEVEL;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  question: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sampleQuestion: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  testCases: CustomQuestionTestCase[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  public: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  inputType: QUESTION_INPUT_TYPE[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  outputType: QUESTION_OUTPUT_TYPE;
}
