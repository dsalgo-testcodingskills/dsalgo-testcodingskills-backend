import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  timestamps: true,
})
export class Organization {
  @Prop()
  name: string;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  })
  createdBy: any;
  @Prop()
  availableTests: number;
  @Prop()
  noOfUsers: number;
  @Prop()
  subscriptionPlan: string;
  @Prop({
    default: null,
  })
  organizationLogo: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
