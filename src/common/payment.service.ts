import { Injectable } from '@nestjs/common';
import { InjectRazorpay } from 'nestjs-razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService{

    public constructor(
        @InjectRazorpay() private readonly razorpayInstance: any,
      ) {}
    //To create an order on razorpay for a payment
    async createOrder(organizationId) {
        const options = {
            amount: 50000, // amount in smallest currency unit
            currency: "INR",
            notes:{
                organizationId 
            }
        };

        return await this.razorpayInstance.orders.create(options); 
    }

    //To verify the successfull payments
    async verifyPayment(body, razorpaySignature) {
        const shasum = crypto.createHmac("sha256", "test@123");
        shasum.update(JSON.stringify(body));
        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        return (digest !== razorpaySignature) ? false: true;
    }

}
