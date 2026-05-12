import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class TestCaseResultDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  input: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  output: any;

  @ApiProperty({ required: false })
  @IsOptional()
  hidden: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  runtime: number;

  @ApiProperty({ required: false })
  @IsOptional()
  memory: number;
}

export class CreateTestDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  sendMail: boolean;

  @ApiProperty({ required: true })
  @IsOptional()
  phone: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  questionsTypes: Object; // question with types easy,medium, hard

  @ApiProperty({ required: false })
  @IsOptional()
  testDuration = 60; // in minutes

  @ApiProperty({ required: false, description: 'timestamp required' })
  @IsOptional()
  startDate: number;

  @ApiProperty({ required: false, description: 'timestamp required' })
  @IsOptional()
  endDate: number;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedQuestions: { label: string; _id: string; level: string }[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  webcamStatus: boolean;
}

export class SaveAnswerDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  questionId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  testId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  language: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  imgURL: string;
  @ApiProperty({ required: false, type: [TestCaseResultDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseResultDTO)
  testCases: TestCaseResultDTO[];
}

export class SubmitAnswerDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  testId: Types.ObjectId;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  questionId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  code: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  language: string;
  @ApiProperty({ required: false, type: [TestCaseResultDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseResultDTO)
  testCases: TestCaseResultDTO[];
}

export class getallTestsubmissionsDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  page: number = 1;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  limit: number = 10;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  filter: {
    [key: string]: string | {};
  };
}

export class shortlistedDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  testId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  moderation: object;
}

export class MoodDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  mood: string;
}

//USer info Detilas
export class UserInfoDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  studentName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: string;
}

//cognito update dto
export class updateAttributes {
  @ApiProperty({ required: false })
  @IsOptional()
  username: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  organizationName: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  sub: string;
}

export class MultiLinkDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  questionsTypes: Object; // question with types easy,medium, hard

  @ApiProperty({ required: false })
  @IsOptional()
  testDuration = 60; // in minutes

  @ApiProperty({ required: false, description: 'timestamp required' })
  @IsOptional()
  startDate: number;

  @ApiProperty({ required: false, description: 'timestamp required' })
  @IsOptional()
  endDate: number;

  @ApiProperty({ required: false })
  @IsOptional()
  selectedQuestions: { label: string; _id: string; level: string }[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  TestType: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  Title: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  Description: string;
}
