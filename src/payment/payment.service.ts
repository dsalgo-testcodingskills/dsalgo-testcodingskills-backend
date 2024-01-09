import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentDocument } from './SCHEMA/payment.schema';
import { SubscriptionDocument } from './SCHEMA/subscription.schema';
import { OrganizationDocument } from 'src/auth/schema/organization.schema';
import { InjectRazorpay } from 'nestjs-razorpay';
import * as crypto from 'crypto';
import { UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class RazorPayPaymentService {
  public constructor(
    @InjectRazorpay()
    private readonly razorpayInstance: any,
    @InjectModel('payment')
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel('organizations')
    private readonly organizationModel: Model<OrganizationDocument>,
    @InjectModel('subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel('users')
    private readonly userModel: Model<UserDocument>,
  ) {}

  dbSession() {
    return this.subscriptionModel.db.startSession();
  }

  async createPayment(payment) {
    if (payment.notes.organizationId) {
      return await this.paymentModel.create(payment, async (err, result) => {
        if (!err) {
          const createdData = await this.organizationModel.findOneAndUpdate(
            {
              _id: Types.ObjectId.createFromHexString(
                payment.notes.organizationId,
              ),
            },
            {
              $inc: {
                availableTests: Number(process.env.TOTAL_TEST_INCREMENT),
                noOfUsers: Number(process.env.TOTAL_USER_INCREMENT),
              },
              $set: { subscriptionPlan: 'paid' },
            },
            { new: true },
          );
          console.log('createdData after new payment :>> ', createdData);
        }
      });
    } else if (payment.email) {
      return await this.paymentModel.create(payment, async (err, result) => {
        if (!err) {
          const orgId = await this.userModel.findOne(
            { emailId: payment.email },
            { orgId: 1 },
          );
          const updatedData = await this.organizationModel.findOneAndUpdate(
            {
              _id: Types.ObjectId.createFromHexString(orgId.orgId),
            },
            {
              $inc: {
                availableTests: Number(process.env.TOTAL_TEST_INCREMENT),
                noOfUsers: Number(process.env.TOTAL_USER_INCREMENT),
              },
              $set: { subscriptionPlan: 'paid' },
            },
            { new: true },
          );
          console.log('updatedData after recurring payment:>> ', updatedData);
        }
      });
    }
  }

  async createSubscription(organizationId, planId) {
    const options = {
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        organizationId,
      },
    };

    const subscription = await this.razorpayInstance.subscriptions.create(
      options,
    );
    let orgId = organizationId;
    let subcheck = await this.subscriptionModel.findOne({
      notes: { organizationId: orgId },
    });

    if (!subcheck) {
      let subcreate = await this.subscriptionModel.create(subscription);
    }

    return subscription;
  }

  //To verify the successfull payments
  async verifyRazorpayData(body, razorpaySignature) {
    const shasum = crypto.createHmac('sha256', 'test@123');
    shasum.update(JSON.stringify(body));
    const digest = shasum.digest('hex');

    // comaparing our digest with the actual signature
    return digest !== razorpaySignature ? false : true;
  }

  async getAllPlans() {
    return await this.razorpayInstance.plans.all();
  }

  async getPlan(planId) {
    return await this.razorpayInstance.plans.fetch(planId);
  }

  async updateSubscription(subscription) {
    return await this.subscriptionModel.findOneAndUpdate(
      { id: subscription.id },
      subscription,
    );
  }

  async getSubsDetails(orgId) {
    return this.subscriptionModel.find({
      notes: { organizationId: orgId },
    });
  }

  async getPaymentDetails(orgId) {
    return this.paymentModel
      .find({
        notes: { organizationId: orgId },
      })
      .sort({ createdAt: -1 });
  }

  async updateSubscriptionStatus(orgId) {
    return await this.subscriptionModel.findOneAndUpdate(
      { notes: { organizationId: orgId } },
      { $set: { status: 'active' } },
    );
  }

  async cancelSubscription(subscriptionId, options: boolean) {
    const subCancelData = await this.razorpayInstance.subscriptions.cancel(
      subscriptionId,
      options,
    );

    return subCancelData;
  }

  async updateSubOnCancellation(filter, updateBody, options = {}) {
    return this.subscriptionModel
      .findOneAndUpdate(filter, updateBody, options)
      .lean();
  }

  async unixToDate(unixDate) {
    let date = new Date(unixDate);
    console.log(date);

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let fullDate = day + '.' + month + '.' + year + '.';

    console.log(fullDate);
    return fullDate;
  }

  async cancelSubSerivices() {
    return this.subscriptionModel.find({ status: 'cancelled' });
  }

  async resetLimits(orgId) {
    let result = await this.organizationModel.findOneAndUpdate(
      {
        _id: Types.ObjectId.createFromHexString(orgId),
      },
      {
        $set: {
          availableTests: 20,
          noOfUsers: 3,
          subscriptionPlan: 'free',
        },
      },
    );
    return result;
  }
}
