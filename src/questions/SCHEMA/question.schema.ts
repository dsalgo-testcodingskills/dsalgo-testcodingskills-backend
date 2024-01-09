import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { QUESTION_INPUT_TYPE, QUESTION_OUTPUT_TYPE } from 'src/utils/constants';
import { DIFFICULTY_LEVEL, testCase} from '../question.types';

export type QuestionDocument = Question & mongoose.Document;

export interface sampleCodeInterface {
  langauge: string;
  code: string;
}

@Schema({
  timestamps: true,
})
export class Question {
  @Prop()
  level: DIFFICULTY_LEVEL;

  @Prop()
  question: string;

  @Prop()
  sampleQuestion: boolean;

  @Prop()
  instructions: string;

  @Prop()
  testCases: testCase[];

  @Prop()
  createdBy: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'organizations' })
  organizationId: mongoose.Types.ObjectId;

  @Prop()
  public: boolean;

  @Prop()
  solutionTemplates: sampleCodeInterface[];

  @Prop()
  inputType?: QUESTION_INPUT_TYPE[];

  @Prop()
  outputType?: QUESTION_OUTPUT_TYPE;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
