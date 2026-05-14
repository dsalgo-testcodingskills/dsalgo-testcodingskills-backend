import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestDocument } from '../test/SCHEMA/test.schema';
import { getallTestsubmissionsDTO } from '../test/DTO/test.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel('tests')
    private readonly testsModel: Model<TestDocument>,
  ) {}

  create(createSuperAdminDto: CreateSuperAdminDto) {
    return 'This action adds a new superAdmin';
  }

  async getAllTests(body: getallTestsubmissionsDTO) {
    try {
      const skip = body.page * body.limit - body.limit;
      let match: any = {
        ...body.filter,
        ParentID: null,
      };

      if (match.organisationId && typeof match.organisationId === 'string') {
        match.organisationId = new Types.ObjectId(match.organisationId);
      }

      if (body.filter?.moderationStatus) {
        match = {
          ...match,
          'moderation.status': body.filter.moderationStatus,
        };
        delete match.moderationStatus;
      }

      if (body.filter?.testType) {
        match = {
          ...match,
          'TestType.TestType': body.filter.testType,
        };
        delete match.testType;
      }

      const [data, count] = await Promise.all([
        this.testsModel
          .find(match, { questions: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(body.limit)
          .lean(),
        this.testsModel.find(match).countDocuments(),
      ]);
      return {
        data,
        count,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    return `This action returns all superAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} superAdmin`;
  }

  update(id: number, updateSuperAdminDto: UpdateSuperAdminDto) {
    return `This action updates a #${id} superAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} superAdmin`;
  }
}
