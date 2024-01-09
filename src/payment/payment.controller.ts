import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Get,
  Post,
  Req,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

import { RazorPayPaymentService } from './payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly razorPayPaymentService: RazorPayPaymentService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('/createSubscription')
  async createSubscription(@Body() body: { planId: string }, @Req() request) {
    try {
      if (body.planId) {
        let plan = await this.razorPayPaymentService.getPlan(body.planId);
        if (!plan) return { message: 'Invalid plan id', statusCode: 400 };
      } else return { message: 'Plan Id required', statusCode: 400 };

      const subscription = await this.razorPayPaymentService.createSubscription(
        request.payload['custom:orgId'],
        body.planId,
      );
      if (!subscription)
        return {
          message: 'Some error occured while creating the subscription',
          statusCode: 502,
        };

      return subscription;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/subscription/status')
  async updateSubscriptionStatus(
    @Body() body: any,
    @Headers('X-Razorpay-Signature') razorpaySignature: string,
  ) {
    try {
      const valid = await this.razorPayPaymentService.verifyRazorpayData(
        body,
        razorpaySignature,
      );
      if (!valid)
        throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);

      if (body.contains.includes('subscription')) {
        console.log('updating subscrptions', body.payload.subscription.entity);
        await this.razorPayPaymentService.updateSubscription(
          body.payload.subscription.entity,
        );
      }
      if (body.contains.includes('payment')) {
        console.log('updating payments :>>', body.payload.payment.entity);
        await this.razorPayPaymentService.createPayment(
          body.payload.payment.entity,
        );
      }
      return {
        message: 'success',
        statusCode: 200,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('/getAllplans')
  async getAllPlans() {
    return await this.razorPayPaymentService.getAllPlans();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('/getPlan/:planId')
  async getPlan(@Param('planId') planId: string) {
    return await this.razorPayPaymentService.getPlan(planId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('getSubscriptionDetails')
  async getSubscriptionDetail(@Req() request) {
    try {
      let orgId = request.payload['custom:orgId'];

      const subscriptionDetails =
        await this.razorPayPaymentService.getSubsDetails(orgId);

      if (!subscriptionDetails) {
        return {
          statusCode: 204,
          message: 'No Subscription found',
        };
      }

      return {
        statusCode: 200,
        message: 'success',
        data: subscriptionDetails,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Get('getPaymentDetails')
  async getPaymentDetails(@Req() request) {
    try {
      let orgId = request.payload['custom:orgId'];

      const paymentDetails =
        await this.razorPayPaymentService.getPaymentDetails(orgId);

      if (!paymentDetails) {
        return {
          statusCode: 204,
          message: 'No Payments found',
        };
      }

      return {
        statusCode: 200,
        message: 'success',
        data: paymentDetails,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Patch('updateSubscriptionDetails')
  async updateSubscriptionDetails(@Req() request) {
    try {
      let orgId = request.payload['custom:orgId'];

      let updateSubs =
        await this.razorPayPaymentService.updateSubscriptionStatus(orgId);

      updateSubs.save();

      if (updateSubs) {
        return {
          statusCode: 200,
          message: 'success',
          data: updateSubs,
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT')
  @Post('cancelSubscription')
  async cancelSubscription(@Req() request) {
    try {
      let orgId = request.payload['custom:orgId'];

      const subscriptionDetails =
        await this.razorPayPaymentService.getSubsDetails(orgId);

      const subscriptionId = subscriptionDetails[0].id;
      const data = await this.razorPayPaymentService.cancelSubscription(
        subscriptionId,
        true,
      );
      console.log(data.current_end);
      const abs = await this.razorPayPaymentService.unixToDate(
        parseInt(data.current_end.toString() + '000'),
      );

      const result = await this.razorPayPaymentService.updateSubOnCancellation(
        { id: subscriptionId },
        {
          status: 'cancelled',
          endDateString: abs,
          current_end: data.current_end,
        },
      );

      return {
        statusCode: 200,
        message: 'success',
        cancelData: result,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  // Logic of cron
  @Post('cancelServices')
  async cancelSubscriptionServices() {
    let cancelledData: any =
      await this.razorPayPaymentService.cancelSubSerivices();
    console.log('canData>>', cancelledData);
    let orgId = null;
    let result = null;

    let date = new Date();
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let fullDate = day + '.' + month + '.' + year + '.';
    console.log(fullDate);

    for (let i = 0; i < cancelledData.length; i++) {
      console.log(cancelledData[i].endDateString);

      if (cancelledData[i].endDateString === fullDate) {
        orgId = cancelledData[i].notes.organizationId;

        result = await this.razorPayPaymentService.resetLimits(orgId);
        console.log('result>>', result);
      }
    }
    return result;
  }
}
