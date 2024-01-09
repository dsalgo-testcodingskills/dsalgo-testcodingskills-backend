import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { RazorpayModule } from 'nestjs-razorpay';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompilerController } from './compiler/compiler.controller';
import { CompilerService } from './compiler/compiler.service';
import { TestSchema } from './test/SCHEMA/test.schema';
import { TestController } from './test/test.controller';
import { TestService } from './test/test.service';
import { MoodSchema } from './test/SCHEMA/mood.schema';
import { BaragenessController } from './barageness/barageness.controller';
import { BaragenessService } from './barageness/barageness.service';
import { CustomeSchema } from './barageness/SCHEMA/custome.schema';
import { MotorDesignSchema } from './barageness/SCHEMA/motor.schema';
import { ContactSchema } from './barageness/SCHEMA/contact.schema';
import { CustomeImgSchema } from './barageness/SCHEMA/image.schema';
import { CustomImgService } from './barageness/customeImg.servics';
import { CustomeImgController } from './barageness/customeImg.controllers';
import { AuthenticationController } from './auth/authentication.controller';
import { AuthenticationService } from './auth/authentication.service';
import { OrganizationSchema } from './auth/schema/organization.schema';
import { QuestionsController } from './questions/question.controller';
import { QuestionsService } from './questions/question.service';
import { QuestionSchema } from './questions/SCHEMA/question.schema';
import { PaymentService } from './common/payment.service';

import { config } from 'dotenv';
import { PaymentSchema } from './payment/SCHEMA/payment.schema';
import { PaymentController } from './payment/payment.controller';
import { SubscriptionSchema } from './payment/SCHEMA/subscription.schema';
import { RazorPayPaymentService } from './payment/payment.service';
import { UserSchema } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
config();

@Module({
  imports: [
    RazorpayModule.forRoot({
      key_id: process.env.RAZORPAY_SECRET_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      { name: 'users', schema: UserSchema },
      { name: 'tests', schema: TestSchema },
      { name: 'mood', schema: MoodSchema },
      { name: 'custome', schema: CustomeSchema },
      { name: 'motorDesign', schema: MotorDesignSchema },
      { name: 'contact', schema: ContactSchema },
      { name: 'CustomeImg', schema: CustomeImgSchema },
      { name: 'organizations', schema: OrganizationSchema },
      { name: 'questions', schema: QuestionSchema },
      { name: 'payment', schema: PaymentSchema },
      { name: 'subscription', schema: SubscriptionSchema },
    ]),
  ],
  controllers: [
    AppController,
    CompilerController,
    TestController,
    BaragenessController,
    CustomeImgController,
    AuthenticationController,
    QuestionsController,
    PaymentController,
    UserController,
  ],
  providers: [
    AppService,
    CompilerService,
    PaymentService,
    TestService,
    BaragenessService,
    CustomImgService,
    AuthenticationService,
    QuestionsService,
    RazorPayPaymentService,
    UserService,
  ],
})
export class AppModule {}
