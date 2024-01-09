import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserStatusEnum } from 'src/common/enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  name: string;

  @Prop({ index: true, unique: true })
  emailId: string;

  @Prop()
  cognitoId: string;

  @Prop()
  orgId: string;

  @Prop()
  role: string;

  @Prop({ default: UserStatusEnum.ACTIVE })
  status: UserStatusEnum;

  @Prop({ default: false })
  temporaryPasswordChanged: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
