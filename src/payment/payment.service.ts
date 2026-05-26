import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { PaymentDocument } from './SCHEMA/payment.schema';
import { SubscriptionDocument } from './SCHEMA/subscription.schema';
import { OrganizationDocument } from 'src/auth/schema/organization.schema';
import { InjectRazorpay } from 'nestjs-razorpay';
import * as crypto from 'crypto';
import { UserDocument } from 'src/user/entities/user.entity';
import { PLAN_LIMITS } from 'src/common/plan-limits';
import { RAZOR_WEBHOOK_KEY, SUBSCRIPTION_STATUS } from 'src/common/enum';

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

  dbSession(): Promise<ClientSession> {
    return this.subscriptionModel.db.startSession();
  }

  async recordPayment(payment) {
    return await this.paymentModel.findOneAndUpdate(
      { id: payment.id },
      { $set: payment },
      { upsert: true, new: true }
    );
  }

  async processSubscriptionPayment(payment) {
    let orgId = payment.notes?.organizationId;
    if (!orgId && payment.email) {
      const user = await this.userModel.findOne({ emailId: payment.email }, { orgId: 1 });
      orgId = user?.orgId;
    }

    if (orgId) {
          const updatedData = await this.organizationModel.findOneAndUpdate(
            {
              _id: Types.ObjectId.createFromHexString(orgId)
            },
            {
              $inc: {
                availableTests: PLAN_LIMITS.paid.tests,
                noOfUsers: PLAN_LIMITS.paid.users,
                availableCustomQuestions: PLAN_LIMITS.paid.customQuestions,
              },
              $set: { subscriptionPlan: 'paid' },
            },
            { new: true },
          );
          console.log('Organization limits updated after successful subscription payment:', orgId);
      return updatedData;
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
    let subcheck = await this.subscriptionModel.findOne({ "notes.organizationId": orgId });

    if (!subcheck) {
      let subcreate = await this.subscriptionModel.create(subscription);
    }

    return subscription;
  }
  async createOrder(options) {
    return await this.razorpayInstance.orders.create(options);
  }

  async processTopUp(payment) {
    const orgId = payment.notes?.organizationId;
    const itemType = payment.notes?.itemType;
    const quantity = parseInt(payment.notes?.quantity || '0');

    if (!orgId) return;

    const updateQuery = itemType === 'test' 
      ? { $inc: { availableTests: quantity } }
      : { $inc: { availableCustomQuestions: quantity } };

    const updated = await this.organizationModel.findOneAndUpdate(
      { _id: Types.ObjectId.createFromHexString(orgId) },
      updateQuery,
      { new: true }
    );
    console.log(`Add-on limits updated (${itemType} x ${quantity}) for:`, orgId);
    return updated;
  }

  //To verify the successfull payments
  async verifyRazorpayData(body, razorpaySignature) {
    const shasum = crypto.createHmac('sha256', RAZOR_WEBHOOK_KEY);
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
    return this.subscriptionModel.find({ "notes.organizationId": orgId });
  }

  async getPaymentDetails(orgId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.paymentModel
        .find({ "notes.organizationId": orgId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments({ "notes.organizationId": orgId })
    ]);

    return { data, total };
  }

  async updateSubscriptionStatus(orgId) {
    return await this.subscriptionModel.findOneAndUpdate(
      { "notes.organizationId": orgId },
      { $set: { status: SUBSCRIPTION_STATUS.ACTIVE } },
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
    return this.subscriptionModel.find({ status: SUBSCRIPTION_STATUS.CANCELLED });
  }

  async resetLimits(orgId) {
    let result = await this.organizationModel.findOneAndUpdate(
      {
        _id: Types.ObjectId.createFromHexString(orgId),
      },
      {
        $set: {
          availableTests: PLAN_LIMITS.free.tests,
          availableCustomQuestions: PLAN_LIMITS.free.customQuestions,
          noOfUsers: PLAN_LIMITS.free.users,
          subscriptionPlan: 'free',
        },
      },
    );
    return result;
  }
}
