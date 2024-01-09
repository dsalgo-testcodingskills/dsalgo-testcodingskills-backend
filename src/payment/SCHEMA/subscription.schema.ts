import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({
  timestamps: true,
})
export class Subscription {
  @Prop({ type: String, unique: true })
  id: string;

  @Prop({ type: String })
  entity: string;

  @Prop({ type: String })
  plan_id: string;

  @Prop({ type: String })
  customer_id: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: Number })
  current_start?: number;

  @Prop({ type: Number })
  current_end?: number;

  @Prop({ type: Number })
  ended_at?: number;

  @Prop({ type: Number })
  quantity?: number;

  @Prop({ type: Object })
  notes?: object;

  @Prop({ type: Number })
  charge_at?: number;

  @Prop({ type: Number })
  start_at?: number;

  @Prop({ type: Number })
  end_at?: number;

  @Prop({ type: Number })
  total_count?: number;

  @Prop({ type: Number })
  paid_count?: number;

  @Prop({ type: Boolean })
  customer_notify?: boolean;

  @Prop({ type: Number })
  created_at?: number;

  @Prop({ type: Number })
  expire_by?: number;

  @Prop({ type: String })
  payment_method?: string;

  @Prop({ type: String })
  offer_id?: string;

  @Prop({ type: Number })
  remaining_count?: number;

  @Prop({ type: String })
  endDateString: string;
}
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ id: 1 });
