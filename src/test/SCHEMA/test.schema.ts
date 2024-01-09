import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type TestDocument = Test & Document;

export interface moderationType {
  status: string;
  message: string;
}
@Schema({
  timestamps: true,
})
export class Test {
  @Prop()
  testDuration: number;

  @Prop()
  emailId: string;

  @Prop()
  phone: string;

  @Prop()
  status: string;

  @Prop()
  questions: [Object];

  @Prop({
    type: Object,
  })
  questionsTypes: Object;

  @Prop()
  testExpiry: number;

  @Prop({ default: Date.now() })
  startDate: number;

  @Prop()
  endDate: number;

  @Prop({ default: false })
  isExpired: boolean;

  @Prop({ type: Object })
  moderation: moderationType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
  })
  organisationId: any;

  @Prop()
  tags: [string];

  @Prop()
  studentName: string;

  @Prop()
  TestType: string;

  @Prop()
  ParentID: string;

  @Prop()
  Title: string;

  @Prop()
  Description: string;

  @Prop()
  webcamStatus: boolean;
}

export const TestSchema = SchemaFactory.createForClass(Test);
