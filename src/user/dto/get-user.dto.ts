import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class GetUserDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({ required: true, description: 'page', example: 1 })
  page: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(50)
  @ApiProperty({ required: true, description: 'limit', example: 10 })
  limit: number = 10;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'filter', example: {} })
  filter: Record<string, unknown> = {};
}
