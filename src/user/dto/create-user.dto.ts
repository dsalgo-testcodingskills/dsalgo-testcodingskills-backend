import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from 'src/common/enum';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  emailId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRoleEnum)
  @ApiProperty({ required: true })
  @IsNotEmpty()
  role: string;
}
