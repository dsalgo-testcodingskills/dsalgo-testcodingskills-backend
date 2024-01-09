import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { imageDto } from './DTO/barageness.dto';
import { CustomImgService } from './customeImg.servics';
import { Types } from 'mongoose';

@ApiTags('customImg')
@Controller('customImg')
export class CustomeImgController {
  constructor(private readonly customImgService: CustomImgService) {}

  @Get('findcustomimg/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'write customeInqId',
  })
  async findCustomImg(@Param() param: any) {
    try {
      const res = await this.customImgService.customeImg({
        inqueryId: new Types.ObjectId(param.id),
      });
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('add-image')
  async addImage(@Body() body: imageDto) {
    try {
      await this.customImgService.addImage({
        ...body,
        inqueryId: new Types.ObjectId(body.inqueryId),
      });
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
