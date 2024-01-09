import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomeDocument } from '../barageness/SCHEMA/custome.schema';
import { MotorDesignDocument } from '../barageness/SCHEMA/motor.schema';
import { ContactDocument } from './SCHEMA/contact.schema';

@Injectable()
export class BaragenessService {
  constructor(
    @InjectModel('custome')
    private readonly customeModel: Model<CustomeDocument>,
    @InjectModel('motorDesign')
    private readonly motorDesignModel: Model<MotorDesignDocument>,
    @InjectModel('contact')
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  createCustome(body) {
    return this.customeModel.create(body);
  }

  createMotorDesign(body) {
    return this.motorDesignModel.create(body);
  }

  createContact(body) {
    return this.contactModel.create(body);
  }

  async getCustomeUser(body): Promise<any> {
    const skip = body.page * body.limit - body.limit;
    const [userList, userCount] = await Promise.all([
      this.customeModel
        .find(body.filter)
        .sort(body.sort)
        .skip(skip)
        .limit(body.limit),
      this.customeModel.find(body.filter).count(),
    ]);
    return {
      userList,
      userCount,
    };
  }

  async getMotorUser(body): Promise<any> {
    const skip = body.page * body.limit - body.limit;
    const [userList, userCount] = await Promise.all([
      this.motorDesignModel
        .find(body.filter)
        .sort(body.sort)
        .skip(skip)
        .limit(body.limit),
      this.motorDesignModel.find(body.filter).count(),
    ]);
    return {
      userList,
      userCount,
    };
  }

  async getContact(body): Promise<any> {
    const skip = body.page * body.limit - body.limit;
    const [userList, userCount] = await Promise.all([
      this.contactModel
        .find(body.filter)
        .sort(body.sort)
        .skip(skip)
        .limit(body.limit),
      this.contactModel.find(body.filter).count(),
    ]);
    return {
      userList,
      userCount,
    };
  }

  async deleteUser(body) {
    return this.customeModel.findByIdAndDelete(body);
  }

  async deleteMotorUser(body) {
    return this.motorDesignModel.findByIdAndDelete(body);
  }
}
