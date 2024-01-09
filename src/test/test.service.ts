import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sendMail } from 'src/common/common.functions';
import {
  getallTestsubmissionsDTO,
  SaveAnswerDTO,
  SubmitAnswerDTO,
  updateAttributes,
} from './DTO/test.dto';
import { TestDocument } from './SCHEMA/test.schema';
import { MoodDocument } from './SCHEMA/mood.schema';

import * as moment from 'moment';
import { Types } from 'mongoose';
import * as AWS from 'aws-sdk';
import { OrganizationDocument } from '../auth/schema/organization.schema';

@Injectable()
export class TestService {
  constructor(
    @InjectModel('tests')
    private readonly testsModel: Model<TestDocument>,
    @InjectModel('mood')
    private readonly moodModel: Model<MoodDocument>,
    @InjectModel('organizations')
    private readonly orgmodel: Model<OrganizationDocument>,
  ) {}
  S3 = new AWS.S3({
    region: 'us-east-2',
    signatureVersion: 'v4',
  });

  createTest(body) {
    return this.testsModel.create(body);
  }

  updateOrganization(filter, updateBody) {
    return this.orgmodel.findOneAndUpdate(filter, updateBody);
  }

  getOrganization(filter) {
    return this.orgmodel.findOne(filter).lean();
  }

  createMood(body) {
    return this.moodModel.create(body);
  }

  getPresignedUrl(originalURL = '', expireInSec = 300) {
    if (originalURL) {
      const splitUrl = originalURL.split('algo-user-images/');
      const signedUrl = this.S3.getSignedUrl('getObject', {
        Bucket: `algo-user-images`,
        Key: splitUrl[splitUrl.length - 1],
        Expires: expireInSec,
      });
      return signedUrl;
    }
    return '';
  }

  getRandom(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);

    if (len == 0) {
      return [];
    }
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      const s = Math.random();
      const x = Math.floor(s * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  async sendMail(testDetails, logo) {
    try {
      let logoURl = logo.organizationLogo;
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        subject: `Coding Test Invitation | Code B`,
        to: [testDetails.emailId],
        text: `Hello, A Test has been created for you. 
        This link will be active from ${moment(testDetails.startDate)
          .utcOffset('+0530')
          .format('DD-MM-YYYY HH:mm')} to ${moment(testDetails.endDate)
          .utcOffset('+0530')
          .format('DD-MM-YYYY HH:mm')}
        
        Best of luck`,
      };
      return sendMail(
        mailOptions,
        `${process.env.FRONTEND_URL}/student/test/${testDetails._id}`,
        logoURl,
      );
    } catch (error) {
      return error;
    }
  }

  async sendMailForUser(credentials) {
    try {
      console.log('Password', credentials.password);
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        subject: `User Credentials `,
        to: [credentials.emailId],

        html: `<p>Dear User,</p><p>An account has been created for you on <strong>DSAlgo</strong>,<br> Please click on the link below to activate your account.</p> <br>
        <a
        href="${process.env.FRONTEND_URL}/changePassword/${credentials.emailId}/${credentials.password}"
        class="btn"
        style="
          color: #fff;
          cursor: pointer;
          border-radius: 50rem;
          background-color: #00bcd4;
          border-color: #00bcd4;
          font-weight: 400;
          line-height: 1.5;
          text-align: center;
          text-decoration: none;
          vertical-align: middle;
          padding: 0.5rem 1.5rem;
          font-size: 1rem;
        "
        >Click Here</a>
        
  <p>Best Regards,</p><p>Team DSAlgo</p>
          
         `,
      };

      return sendMail(mailOptions);
    } catch (error) {
      return error;
    }
  }

  getTest(id) {
    return this.testsModel.findById(id).lean();
  }
  getChildTest(id) {
    return this.testsModel
      .find({ $and: [{ ParentID: id }, { ParentID: { $ne: null } }] })
      .lean();
  }
  getMultiLinkCount(id: string) {
    return this.testsModel.find({ ParentID: id }).lean().count();
  }
  saveAnswer(body: SaveAnswerDTO, updateAnswer) {
    return this.testsModel.findOneAndUpdate(
      { _id: body.testId, 'questions.id': new Types.ObjectId(body.questionId) },
      {
        $set: { 'questions.$.status': 'attempted' },
        $push: { 'questions.$.answer': updateAnswer },
      },
      { new: true },
    );
  }

  submitAnswer(body: SubmitAnswerDTO, updateAnswer) {
    return this.testsModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(body.testId),
        'questions.id': new Types.ObjectId(body.questionId),
      },
      {
        $set: { 'questions.$.status': 'completed' },
        $push: { 'questions.$.answer': updateAnswer },
      },
    );
  }

  update(id, body) {
    return this.testsModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { ...body },
      },
      { new: true },
    );
  }

  async checkExpiry(id, test) {
    try {
      if (test?.isExpired) {
        return test;
      }
      if (test?.testExpiry) {
        const expiry = test?.testExpiry;
        const now = moment().valueOf();
        const isExpired = expiry <= now ? true : false;
        if (isExpired) {
          const result: any = await this.update(id, { isExpired });
          return {
            message: 'Your Test is expired',
            status: 'expired',
            result,
          };
        }
      }
      return null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllTests(body: getallTestsubmissionsDTO, organisationId: string) {
    try {
      const skip = body.page * body.limit - body.limit;
      let match: any = {
        ...body.filter,
        organisationId: new Types.ObjectId(organisationId),
        ParentID: null,
      };

      if (body.filter?.moderationStatus) {
        match = {
          ...match,
          moderation: { status: body.filter.moderationStatus, message: '' },
        };
      }
      // For Test type filteration
      if (body.filter?.testType) {
        match = {
          ...match,
          TestType: { TestType: body.filter.testType },
        };
      }

      const [data, count] = await Promise.all([
        this.testsModel
          .find(match, { questions: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(body.limit)
          .lean(),
        this.testsModel.find(match).count(),
      ]);
      return {
        data,
        count,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateOrganizationOnCognito(
    body: updateAttributes,
    organisationId: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const { username } = body;
        const cognitoidentityServiceProvider =
          new AWS.CognitoIdentityServiceProvider({
            apiVersion: '2016-04-18',
          });

        cognitoidentityServiceProvider.adminUpdateUserAttributes(
          {
            UserAttributes: [
              {
                Name: 'nickname',
                Value: organisationId,
              },
            ],
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
          },
          function (err, data) {
            if (err) {
              console.log('err of updateAttributes', err);
              reject(err.message || JSON.stringify(err));
            }
            console.log('result of updateAttributes', data);
            resolve(data);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async logOut(body: any) {
    const cognitoidentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider({
        apiVersion: '2016-04-18',
      });
    cognitoidentityServiceProvider.adminUserGlobalSignOut(
      body,
      function (err, data) {
        if (err) return err;
        // an error occurred
        else return data; // successful response
      },
    );
  }

  async getMultLinkChildTest(body: getallTestsubmissionsDTO, ParentID: string) {
    try {
      const skip = body.page * body.limit - body.limit;
      let match: any = {
        ...body.filter,
        ParentID: ParentID,
      };

      if (body.filter?.moderationStatus) {
        match = {
          ...match,
          moderation: { status: body.filter.moderationStatus, message: '' },
        };
      }

      const [data, count] = await Promise.all([
        this.testsModel
          .find(match, { questions: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(body.limit)
          .lean(),
        this.testsModel.find(match).count(),
      ]);
      return {
        data,
        count,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  getTests(filter, skip, limit, sort, project = {}) {
    return Promise.all([
      this.testsModel
        .find(filter, project)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.testsModel.find(filter).count(),
    ]);
  }
}
