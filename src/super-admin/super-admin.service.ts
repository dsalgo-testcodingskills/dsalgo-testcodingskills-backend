import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { model, Model, Types } from "mongoose";
import { TestDocument } from "../test/SCHEMA/test.schema";
import { OrganizationDocument } from "../auth/schema/organization.schema";
import { UserDocument } from "../user/entities/user.entity";
import { QuestionDocument } from "../questions/SCHEMA/question.schema";
import { PaymentDocument } from "src/payment/SCHEMA/payment.schema";
import { SubscriptionDocument } from "src/payment/SCHEMA/subscription.schema";
import { PricingSettings } from "./entities/pricing-settings.schema";

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel("tests")
    private readonly testsModel: Model<TestDocument>,
    @InjectModel("organizations")
    private readonly orgModel: Model<OrganizationDocument>,
    @InjectModel("users")
    private readonly userModel: Model<UserDocument>,
    @InjectModel("questions")
    private readonly questionsModel: Model<QuestionDocument>,
    @InjectModel("payments")
    private readonly paymentsModel: Model<PaymentDocument>,
    @InjectModel("subscription")
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel("pricingSettings")
    private readonly pricingModel: Model<PricingSettings>,
  ) {}

  async getAllOrganizations(body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {};

      if (body?.filter?.name) {
        match.name = {
          $regex: body.filter.name,
          $options: "i",
        };
      }

      if (body?.filter?.subscriptionPlan) {
        match.subscriptionPlan = body.filter.subscriptionPlan;
      }

      const [data, count] = await Promise.all([
        this.orgModel
          .find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.orgModel.find(match).countDocuments(),
      ]);
      return {
        data,
        count,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationById(id: string) {
    try {
      const organization = await this.orgModel.findById(id).lean();
      return organization;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationUsers(orgId: string, body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
        orgId: orgId,
      };

      const [data, count] = await Promise.all([
        this.userModel
          .find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.userModel.find(match).countDocuments(),
      ]);
      return { data, count };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationQuestions(orgId: string, body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
        organizationId: new Types.ObjectId(orgId),
      };

      const [data, count] = await Promise.all([
        this.questionsModel
          .find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.questionsModel.find(match).countDocuments(),
      ]);
      return { data, count };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationTests(orgId: string, body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
        organisationId: new Types.ObjectId(orgId),
      };

      const [data, count] = await Promise.all([
        this.testsModel
          .find(match, { questions: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.testsModel.find(match).countDocuments(),
      ]);
      return { data, count };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationPayments(orgId: string, body: any) {
    try {
      const page = body?.page;
      const limit = body?.limit;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
        "notes.organizationId": orgId,
      };

      const [data, count] = await Promise.all([
        this.paymentsModel
          .find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.paymentsModel.find(match).countDocuments(),
      ]);
      return { data, count };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getOrganizationSubscription(orgId: string, body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
        "notes.organizationId": orgId,
      };

      const [data, count] = await Promise.all([
        this.subscriptionModel
          .find(match)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.subscriptionModel.find(match).countDocuments(),
      ]);
      return {
        data,
        count,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getPricing() {
    let settings = await this.pricingModel.findOne();
    if (!settings) {
      settings = await this.pricingModel.create({
        pricePerTest: 10,
        pricePerQuestion: 5,
      });
    }
    return settings;
  }

  async updatePricing(body: any) {
    return await this.pricingModel.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true },
    );
  }

  async getAllPayments(body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {};

      if (body?.filter?.fromDate || body?.filter?.toDate) {
        match.createdAt = {};
        if (body.filter.fromDate) {
          match.createdAt.$gte = new Date(body.filter.fromDate);
        }
        if (body.filter.toDate) {
          const toDate = new Date(body.filter.toDate);
          toDate.setHours(23, 59, 59, 999);
          match.createdAt.$lte = toDate;
        }
      }

      if (body?.filter?.name) {
        const organizations = await this.orgModel.find({
          name: {
            $regex: body.filter.name,
            $options: "i",
          },
        });

        match["notes.organizationId"] = {
          $in: organizations.map((org) => org._id.toString()),
        };
      }

      const [data, count] = await Promise.all([
        this.paymentsModel
          .find(match)
          .populate({
            model: "organizations",
            path: "notes.organizationId",
            select: "name",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.paymentsModel.find(match).countDocuments(),
      ]);
      return {
        data,
        count,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
