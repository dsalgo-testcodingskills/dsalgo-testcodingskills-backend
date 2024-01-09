import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomeImgDocument = CustomeImg & Document;

@Schema({
  timestamps: true,
})
export class CustomeImg {
  @Prop({ type: Types.ObjectId })
  inqueryId: Types.ObjectId;

  @Prop()
  image: string;
}

export const CustomeImgSchema = SchemaFactory.createForClass(CustomeImg);
