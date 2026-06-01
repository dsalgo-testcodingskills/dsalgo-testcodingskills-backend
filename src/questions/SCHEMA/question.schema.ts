import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { QUESTION_INPUT_TYPE, QUESTION_OUTPUT_TYPE } from 'src/utils/constants';
import {
  DIFFICULTY_LEVEL,
  testCase,
  InputTypeWithConstraints,
  QuestionConstraints,
  QUESTION_STATUS,
} from '../question.types';

export type QuestionDocument = Question & mongoose.Document;

export interface sampleCodeInterface {
  language: string;
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

  @Prop({ type: [String] })
  topics: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  testCases: testCase[];

  @Prop()
  createdBy: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'organizations' })
  organizationId: mongoose.Types.ObjectId;

  @Prop()
  public: boolean;

  @Prop()
  solutionTemplates: sampleCodeInterface[];

  // inputType now carries constraints per parameter
  // using Mixed type because constraints shape varies per input type
  // (array needs size, int needs value range, string needs length etc.)
  @Prop({ type: mongoose.Schema.Types.Mixed })
  inputType?: InputTypeWithConstraints[];

  @Prop()
  outputType?: QUESTION_OUTPUT_TYPE;

  //  question level constraints
  @Prop({
    type: {
      timeLimit: { type: Number, default: 2 },
      memoryLimit: { type: Number, default: 256 },
    },
    default: {
      timeLimit: 2,
      memoryLimit: 256,
    },
  })
  constraints?: QuestionConstraints;

  //  question status
  // Questions start as 'draft' and must be verified before publishing.
  // Admin writes a reference solution -> runs against all test cases ->
  // if all pass -> status becomes 'published' -> available for tests
  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status?: QUESTION_STATUS;

  //  reference solution
  // admin's verified correct solution.
  // Used to:
  //   1. Verify question is solvable before publishing
  //   2. Auto generate expected outputs for edge/stress test cases
  //   3. Future: compare candidate approach with reference approach
  @Prop({ type: mongoose.Schema.Types.Mixed })
  referenceSolution?: {
    language: string;   // which language admin used to verify
    code: string;       // the actual solution code
  };
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ status: 1 });
QuestionSchema.index({ organizationId: 1, status: 1 });