import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomeDocument = Custome & Document;

@Schema({
  timestamps: true,
})
export class Custome {
  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  model: string;

  @Prop()
  year: number;

  @Prop()
  designData: string;

  @Prop()
  referalCode: string;
}

export const CustomeSchema = SchemaFactory.createForClass(Custome);
