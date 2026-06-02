import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty, IsOptional, IsNumber,
  IsString, IsEnum, IsBoolean, ValidateNested,
  Min, Max, IsIn, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { QUESTION_INPUT_TYPE, QUESTION_OUTPUT_TYPE } from 'src/utils/constants';
import { DIFFICULTY_LEVEL, testCase, QUESTION_STATUS } from '../question.types';

export interface CustomQuestionTestCase {
  hidden: boolean;
  input: string;
  output: string;

}

export class AllowedCharsDTO {
  @ApiProperty({ required: false, enum: ['lowercase','uppercase','digits','alphanumeric','lowercase_digits','spaces','all'] })
  @IsOptional()
  @IsIn(['lowercase','uppercase','digits','alphanumeric','lowercase_digits','spaces','all'])
  preset?: string;

  @ApiProperty({ required: false, description: 'Custom regex pattern e.g. ^[a-z0-9_]+$' })
  @IsOptional()
  @IsString()
  customRegex?: string;
}

export class ArrayIntConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() canBeEmpty?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minElement?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxElement?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSorted?: boolean;
  @ApiProperty({ required: false, enum: ['asc','desc'] }) @IsOptional() @IsIn(['asc','desc']) sortOrder?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isUnique?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPositiveOnly?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonNegative?: boolean;
}

export class ArrayCharConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() canBeEmpty?: boolean;
  @ApiProperty({ required: false, type: AllowedCharsDTO }) @IsOptional() @ValidateNested() @Type(() => AllowedCharsDTO) allowedChars?: AllowedCharsDTO;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isUnique?: boolean;
}

export class TwoDArrayIntConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minRows?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxRows?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minCols?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxCols?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() canBeEmpty?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minElement?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxElement?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSquare?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSorted?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSymmetric?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPositiveOnly?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonNegative?: boolean;
}

export class TwoDArrayCharConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minRows?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxRows?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minCols?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxCols?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() canBeEmpty?: boolean;
  @ApiProperty({ required: false, type: AllowedCharsDTO }) @IsOptional() @ValidateNested() @Type(() => AllowedCharsDTO) allowedChars?: AllowedCharsDTO;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSquare?: boolean;
}

export class IntConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPositiveOnly?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonNegative?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonZero?: boolean;
}

export class FloatConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() maxValue?: number;
  @ApiProperty({ required: false, description: 'Max decimal places e.g. 2' }) @IsOptional() @IsNumber() @Min(0) @Max(10) decimalPrecision?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPositiveOnly?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonNegative?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isNonZero?: boolean;
}

export class StringConstraintsDTO {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minLength?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(1) maxLength?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() canBeEmpty?: boolean;
  @ApiProperty({ required: false, type: AllowedCharsDTO }) @IsOptional() @ValidateNested() @Type(() => AllowedCharsDTO) allowedChars?: AllowedCharsDTO;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPalindrome?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isUnique?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() hasSpaces?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() caseSensitive?: boolean;
}

export class OutputConstraintsDTO {
  @ApiProperty({ required: false, description: 'Does order matter for array output? Default: true' })
  @IsOptional() @IsBoolean()
  isOrdered?: boolean;

  @ApiProperty({ required: false, description: 'Acceptable float tolerance e.g. 0.001. Default: 0' })
  @IsOptional() @IsNumber() @Min(0)
  tolerance?: number;

  @ApiProperty({ required: false, description: 'Case sensitive string comparison? Default: true' })
  @IsOptional() @IsBoolean()
  caseSensitive?: boolean;
}

// uses a flat constraints object — backend picks relevant fields by type
export class InputTypeWithConstraintsDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  type: string;

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  paramName: string;

  // single flat constraints object — all fields optional
  // backend validates which fields apply based on type
  @ApiProperty({ required: false })
  @IsOptional()
  constraints?: any;
}

export class QuestionConstraintsDTO {
  @ApiProperty({ required: false, default: 2 })
  @IsOptional() @IsNumber() @Min(1) @Max(10)
  timeLimit?: number;

  @ApiProperty({
    required: false,
    default: 256
  })
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(512)
  memoryLimit?: number;
}

export class ReferenceSolutionDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  language: string;

  @ApiProperty({ required: true })
  @IsNotEmpty() @IsString()
  code: string;
}

export class createCustomQuestionDTO {
  organizationId: Types.ObjectId;
  createdBy: string;
  solutionTemplates?: any[];
  status?: QUESTION_STATUS;

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
  @IsArray()
  topics: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  testCases: CustomQuestionTestCase[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  public: boolean;

  @ApiProperty({ required: true, type: [InputTypeWithConstraintsDTO] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputTypeWithConstraintsDTO)
  inputType: InputTypeWithConstraintsDTO[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  outputType: QUESTION_OUTPUT_TYPE;

  @ApiProperty({ required: false, type: QuestionConstraintsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuestionConstraintsDTO)
  constraints?: QuestionConstraintsDTO;

  @ApiProperty({ required: false, type: OutputConstraintsDTO })
  @IsOptional() @ValidateNested() @Type(() => OutputConstraintsDTO)
  outputConstraints?: OutputConstraintsDTO;
}

export class validateReferenceSolutionDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @ApiProperty({ required: true, type: ReferenceSolutionDTO })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ReferenceSolutionDTO)
  referenceSolution: ReferenceSolutionDTO;
}

export class publishQuestionDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  questionId: string;
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: QUESTION_STATUS;

  organizationId: Types.ObjectId;
}

export class createQuestionDTO {
  organizationId: Types.ObjectId;
  createdBy: string;

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
