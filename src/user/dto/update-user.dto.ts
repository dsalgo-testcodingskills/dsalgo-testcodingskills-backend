import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoleEnum, UserStatusEnum } from 'src/common/enum';

export class UpdateUserDto {
  @IsEnum(UserRoleEnum)
  @ApiProperty({ required: false })
  @IsOptional()
  role: string;

  @IsEnum(UserStatusEnum)
  @ApiProperty({ required: false })
  @IsOptional()
  status: number;

  @ApiProperty({ required: false })
  @IsOptional()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  id: string;
}
