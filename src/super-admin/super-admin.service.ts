import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TestDocument } from "../test/SCHEMA/test.schema";
import { getallTestsubmissionsDTO } from "../test/DTO/test.dto";
import { CreateSuperAdminDto } from "./dto/create-super-admin.dto";
import { UpdateSuperAdminDto } from "./dto/update-super-admin.dto";
import { OrganizationDocument } from "../auth/schema/organization.schema";

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel("tests")
    private readonly testsModel: Model<TestDocument>,
    @InjectModel("organizations")
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async getAllOrganizations(body: any) {
    try {
      const page = body?.page || 1;
      const limit = body?.limit || 10;
      const skip = page * limit - limit;
      const match: any = {
        ...body?.filter,
      };

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
}
