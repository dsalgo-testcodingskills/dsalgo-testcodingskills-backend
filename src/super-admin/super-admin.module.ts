import { Module } from "@nestjs/common";
import { SuperAdminService } from "./super-admin.service";
import { SuperAdminController } from "./super-admin.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { TestSchema } from "../test/SCHEMA/test.schema";
import { AuthenticationService } from "../auth/authentication.service";
import { UserService } from "../user/user.service";
import { UserSchema } from "../user/entities/user.entity";
import { OrganizationSchema } from "../auth/schema/organization.schema";
import { SubscriptionSchema } from "../payment/SCHEMA/subscription.schema";
import { QuestionSchema } from "../questions/SCHEMA/question.schema";
import { PaymentSchema } from "src/payment/SCHEMA/payment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "tests", schema: TestSchema },
      { name: "users", schema: UserSchema },
      { name: "organizations", schema: OrganizationSchema },
      { name: "subscription", schema: SubscriptionSchema },
      { name: "questions", schema: QuestionSchema },
      { name: "payments", schema: PaymentSchema },
      { name: "subscriptions", schema: SubscriptionSchema },
    ]),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, AuthenticationService, UserService],
})
export class SuperAdminModule {}
