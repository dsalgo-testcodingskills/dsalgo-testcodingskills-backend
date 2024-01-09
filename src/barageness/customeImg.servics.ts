import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomeImgDocument } from './SCHEMA/image.schema';

@Injectable()
export class CustomImgService {
  constructor(
    @InjectModel('CustomeImg')
    private readonly customeImgModel: Model<CustomeImgDocument>,
  ) {}

  async customeImg(body) {
    return await this.customeImgModel.find(body);
  }

  async addImage(body) {
    return this.customeImgModel.create(body);
  }
}
