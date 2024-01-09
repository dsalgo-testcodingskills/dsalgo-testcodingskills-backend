import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Param,
} from '@nestjs/common';
import { BaragenessService } from './barageness.service';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import {
  contactDataDTO,
  customeDataDTO,
  motorDesignDataDTO,
} from './DTO/barageness.dto';

@ApiTags('barageness')
@Controller('barageness')
export class BaragenessController {
  constructor(private readonly baragenessService: BaragenessService) {}

  @Post('custome')
  async creatCustomeData(@Body() body: customeDataDTO) {
    try {
      const res = await this.baragenessService.createCustome(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('motorDesign')
  async creatMotorDesign(@Body() body: motorDesignDataDTO) {
    try {
      const res = await this.baragenessService.createMotorDesign(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('contact')
  async createContactData(@Body() body: contactDataDTO) {
    try {
      const res = await this.baragenessService.createContact(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('CustomUsers')
  async getCustomUsers(@Body() body: customeDataDTO) {
    try {
      const res = await this.baragenessService.getCustomeUser(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('motorusers')
  async getMotorUsers(@Body() body: motorDesignDataDTO) {
    try {
      const res = await this.baragenessService.getMotorUser(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('contactDetails')
  async getContactUsers(@Body() body: motorDesignDataDTO) {
    try {
      const res = await this.baragenessService.getContact(body);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('deleteuser/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  async deleteUsers(@Param() param: any) {
    try {
      const res = await this.baragenessService.deleteUser(param.id);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('deletemotoruser/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  async deleteMotorUsers(@Param() param: any) {
    try {
      const res = await this.baragenessService.deleteMotorUser(param.id);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
