import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/entities/user.entity';

var generator = require('generate-password');

@Injectable()
export class UserService {
  constructor(
    @InjectModel('users')
    private readonly userModel: Model<UserDocument>,
  ) {}

  autoPassword() {
    return generator.generate({
      length: 8,
      lowercase: true,
      uppercase: true,
      numbers: true,
      strict: true,
    });
  }
  dbSession() {
    return this.userModel.db.startSession();
  }

  createUser(body) {
    return this.userModel.create(body);
  }

  findUsers(filter, skip, limit) {
    return Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),
      this.userModel.find(filter).count(),
    ]);
  }

  getUser(filter: any, project = {}) {
    return this.userModel.findOne(filter, project).lean();
  }

  updateUser(filter, updateBody, options = {}) {
    return this.userModel.findOneAndUpdate(filter, updateBody, options).lean();
  }

  deleteUser(id) {
    return this.userModel.findByIdAndDelete(id);
  }
}
