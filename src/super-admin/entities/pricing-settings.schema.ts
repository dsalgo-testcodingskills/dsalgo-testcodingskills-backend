import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class PricingSettings extends Document {
  @Prop({ type: Number, required: true, default: 10 }) // Price per test in INR
  pricePerTest: number;

  @Prop({ type: Number, required: true, default: 5 }) // Price per question in INR
  pricePerQuestion: number;
}

export const PricingSettingsSchema = SchemaFactory.createForClass(PricingSettings);
