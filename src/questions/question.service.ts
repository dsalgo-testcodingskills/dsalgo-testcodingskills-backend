import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as mongooseTypes } from 'mongoose';
import { createQuestionDTO, getQuestionsDTO } from './DTO/question.dto';
import { QuestionDocument } from './SCHEMA/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('questions')
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  addQuestion(
    reqBody: createQuestionDTO & { questionTemplate: mongooseTypes.ObjectId },
  ) {
    return this.questionModel.create(reqBody);
  }

  async getQuestions(req?: getQuestionsDTO) {
    let match = {};
    if (req?.level) {
      match = { level: req.level };
    }

    if (req?.sampleQuestion !== null && req?.sampleQuestion !== undefined) {
      match = { ...match, sampleQuestion: req.sampleQuestion };
    }

    if (req?.questionId !== null && req?.questionId !== undefined) {
      match = { ...match, _id: new mongooseTypes.ObjectId(req.questionId) };
    }
    const count = await this.questionModel.find(match).count();
    const limit = req?.limit ? req.limit : count;

    let skip = Math.floor(Math.random() * count - 1);
    skip = skip < 0 ? skip + 1 : skip;
    if (count == 1 || count == limit) {
      skip = 0;
    }
    const data = await this.questionModel
      .find(match)
      .limit(limit)
      .skip(skip)
      .lean();
    return { data, count: limit };
  }

  getSampleQuestion() {
    return this.questionModel.find({ sampleQuestion: true }).limit(1).lean();
  }

  getQuestion(questionId) {
    return this.questionModel.findById(questionId);
  }

  createCustomQuestion(body: any) {
    return this.questionModel.create(body);
  }

  async findAndUpdateCustomQuestion(id, payload) {
    try {
      const result = await this.questionModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              ...payload,
            },
          },
          { upsert: true, new: true },
        )
        .lean();
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async find(body, request): Promise<any> {
    try {
      const { page, limit, sorting } = body;

      const skip = page * limit - limit;
      const sort: any =
        sorting === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
      let filterObj = {};

      if (request) {
        filterObj = { $or: [{ organizationId: request }, { public: true }] };
      }

      const [data, count] = await Promise.all([
        this.questionModel
          .find(filterObj)
          .skip(skip)
          .limit(limit)
          .sort(sort)
          .lean(),
        this.questionModel.find(filterObj).countDocuments(),
      ]);

      return {
        data,
        count,
      };
    } catch (e) {
      console.log(e);
    }
  }

  async findById(id) {
    try {
      return this.questionModel.findById(id).lean();
    } catch (e) {
      console.log(e);
    }
  }

  customQuestionCount(filter: any) {
    return this.questionModel.find(filter).count();
  }
}
