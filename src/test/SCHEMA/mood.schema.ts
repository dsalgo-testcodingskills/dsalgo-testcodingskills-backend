import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MoodDocument = Mood & Document;

@Schema({
  timestamps: true,
})
export class Mood {
  @Prop()
  mood: string;
}
export const MoodSchema = SchemaFactory.createForClass(Mood);
