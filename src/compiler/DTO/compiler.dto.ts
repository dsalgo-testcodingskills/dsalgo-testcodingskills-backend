import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { TEST_LANGUAGES } from 'src/utils/constants';

export class CompileCodeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  testId: string;
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
  language: TEST_LANGUAGES;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  sampleQuestion: boolean;

  @ApiProperty({ required: false })
  testCases?: any[];
  @ApiProperty({ required: false })
  inputType?: any[];
  @ApiProperty({ required: false })
  outputType?: string;
  @ApiProperty({ required: false })
  constraints?: any;
  @ApiProperty({ required: false })
  outputConstraints?: any;
  @ApiProperty({ required: false })
  questionType?: string;
}
