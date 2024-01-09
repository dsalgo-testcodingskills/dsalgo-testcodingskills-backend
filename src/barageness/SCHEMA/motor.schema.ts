import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MotorDesignDocument = MotorDesign & Document;

@Schema({
  timestamps: true,
})
export class MotorDesign {
  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  company: string;

  @Prop()
  rnumber: number;

  @Prop()
  designData: string;

  @Prop({
    type: Array,
  })
  image: Array<string>;
}

export const MotorDesignSchema = SchemaFactory.createForClass(MotorDesign);
