import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { QUESTION_OUTPUT_TYPE } from 'src/utils/constants';
import {
  DIFFICULTY_LEVEL, testCase, InputTypeWithConstraints,
  QuestionConstraints, OutputConstraints, QUESTION_STATUS,
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

  // inputType carries full per-parameter constraints ──
  @Prop({ type: mongoose.Schema.Types.Mixed })
  inputType?: InputTypeWithConstraints[];

  @Prop() outputType?: QUESTION_OUTPUT_TYPE;

  //  question level constraints 
  @Prop({
    type: { timeLimit: { type: Number, default: 2 }, memoryLimit: { type: Number, default: 256 } },
    default: { timeLimit: 2, memoryLimit: 256 },
  })
  constraints?: QuestionConstraints;

  // controls how output comparison works during test case evaluation.
  // isOrdered: false -> sort both arrays before comparing (Two Sum etc.)
  // tolerance: 0.001 -> float comparison with tolerance
  // caseSensitive: false -> case insensitive string comparison
  @Prop({
    type: {
      isOrdered:     { type: Boolean, default: true  },
      tolerance:     { type: Number,  default: 0     },
      caseSensitive: { type: Boolean, default: true  },
    },
    default: { isOrdered: true, tolerance: 0, caseSensitive: true },
  })
  outputConstraints?: OutputConstraints;

  @Prop({ type: String, enum: ['draft','published','archived'], default: 'draft' })
  status?: QUESTION_STATUS;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  referenceSolution?: { language: string; code: string; };
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ status: 1 });
QuestionSchema.index({ organizationId: 1, status: 1 });