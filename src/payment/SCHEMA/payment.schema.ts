import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({
  timestamps: true,
})
export class Payment {
  @Prop({
    type: String,
    unique: true
  })
  id: string;

  @Prop({
    type: Number,
  })
  amount:Number;

  @Prop({
    type: String,
  })
  currency:string;

  @Prop({
    type: String,
  })
  status:string;

  @Prop({
    type: String,
  })
  invoice_id:string;

  @Prop({
    type: String,
  })
  customer_id:string;

  @Prop({
    type: Boolean,
  })
  international:boolean;

  @Prop({
    type: String, index: { unique: true}
  })
  order_id: string;

  @Prop({
    type: String,
  })
  method: string;

  @Prop({
    type: String,
  })
  bank: string;

  @Prop({
    type: String,
  })
  email: string;

  @Prop({
    type: String,
  })
  contact: string;

  @Prop({
    type: Object,
  })
  notes: object;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ id: 1 });