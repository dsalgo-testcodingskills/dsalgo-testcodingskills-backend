import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'contentType' })
  contentType: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'testId' })
  path: string;
}
