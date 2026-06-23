import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as mongooseTypes, ClientSession } from 'mongoose';
import { createQuestionDTO, getQuestionsDTO, createCustomQuestionDTO } from './DTO/question.dto';
import { QuestionDocument } from './SCHEMA/question.schema';
import { SubscriptionDocument } from 'src/payment/SCHEMA/subscription.schema';
import {
  QUESTION_TYPE,
  LANGUAGE_CATEGORIES,
} from 'src/utils/constants';
import { getLanguageConfig, getLanguageDataType } from 'src/utils/languageRegistry';



@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel('questions')
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel('subscription')
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  dbSession(): Promise<ClientSession> {
    return this.questionModel.db.startSession();
  }

  generateSolutionTemplates(body: createCustomQuestionDTO) {
    const questionType = body.questionType || QUESTION_TYPE.DSA;
    const templates = [];
    const languages = LANGUAGE_CATEGORIES[questionType] || [];

    for (const langConfig of languages) {
      const lang = langConfig.internal;
      const config = getLanguageConfig(lang);

      if (questionType === QUESTION_TYPE.DSA) {
        const paramsString = config.formatParameters(body.inputType, getLanguageDataType);
        const returnType = getLanguageDataType(lang, body.outputType);

        const code = config.template
          .replace('return_type', returnType)
          .replace('parameters', paramsString);
        console.log("🚀 ~ QuestionsService ~ generateSolutionTemplates ~ code:", code)

        templates.push({
          language: lang,
          versionName: langConfig.name,
          code
        });
      } else if (questionType === QUESTION_TYPE.DATABASE) {
        templates.push({
          language: lang,
          versionName: langConfig.name,
          code: '-- Write your SQL query here\nSELECT * FROM table_name;',
        });
      }
    }
    return templates;
  }


  addQuestion(
    reqBody: createQuestionDTO & { questionTemplate: mongooseTypes.ObjectId },
  ) {
    return this.questionModel.create(reqBody);
  }

  async getQuestions(req?: getQuestionsDTO) {
    let match: any = {};
    if (req?.level) {
      match = { level: req.level };
    }

    if (req?.sampleQuestion !== null && req?.sampleQuestion !== undefined) {
      match = { ...match, sampleQuestion: req.sampleQuestion };
    }

    if (req?.questionId !== null && req?.questionId !== undefined) {
      match = { ...match, _id: new mongooseTypes.ObjectId(req.questionId) };
    }

    if (req?.organizationId) {
      match = {
        ...match,
        $or: [{ organizationId: req.organizationId }, { public: true }],
      };
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

  createCustomQuestion(body: any, session?: ClientSession) {
    return this.questionModel.create([body], { session });
  }

  saveDraft(body: any) {
    return this.questionModel.create({ ...body, isDraft: true });
  }

  async finalizeDraft(id: string) {
    return this.questionModel.findByIdAndUpdate(
      id,
      { $set: { isDraft: false } },
      { new: true },
    );
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
      // let filterObj: any = { isDraft: { $ne: true } };

      // if (request) {
      let filterObj = { $and: [{ $or: [{ organizationId: request }, { public: true }] }] };
      // }

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
    return this.questionModel.find({ ...filter, isDraft: { $ne: true } }).count();
  }

  getSubsDetails(orgId) {
    return this.subscriptionModel.find({ "notes.organizationId": orgId });
  }
}
