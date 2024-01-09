import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({
  timestamps: true,
})
export class Contact {
  @Prop()
  fname: string;

  @Prop()
  lname: string;

  @Prop()
  phone: number;

  @Prop()
  email: string;

  @Prop()
  message: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
