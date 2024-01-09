import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class registerDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  organizationName: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;
}
export class authenticationdata {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;
}
export class changePassword {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  oldPassword: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;
}
export class forgotPasswordDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
}
export class confirmForgotPasswordDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  verificationCode: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;
}
export class verificationCodeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  verificationCode: string;
}
export class resendVerificationCodeDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;
}
