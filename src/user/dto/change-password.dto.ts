import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from 'src/common/enum';

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  oldPassword: string;

  @IsEnum(UserRoleEnum)
  @ApiProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;
}
