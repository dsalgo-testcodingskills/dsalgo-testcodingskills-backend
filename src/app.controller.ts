import { Body, Controller, Get, Post } from '@nestjs/common';
import * as axios from 'axios';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('door')
  doorLockUnlock(): string {
    try {
      return 'ok working';
    } catch (error) {
      return error;
    }
  }

  @Post('gst')
  async gst(@Body() body: any) {
    try {
      const baseURL = 'https://api.mastergst.com';

      const authheaders = {
        Accept: 'application/json',
        ip_address: '182.48.220.109',
        client_id: '507741e9-8e6a-4920-a8c3-c7197774b440',
        client_secret: 'cd99d852-f299-4281-8840-ac7be54455c6',
        gstin: '05AAACH6188F1ZM',
      };
      const authResp = await axios.default.get(
        `${baseURL}/ewaybillapi/v1.03/authenticate`,
        {
          headers: authheaders,
          params: {
            email: 'siddhant.shah@codeb.online',
            username: '05AAACH6188F1ZM',
            password: 'abc123@@',
          },
        },
      );

      const header = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ip_address: '182.48.220.109',
        client_id: '507741e9-8e6a-4920-a8c3-c7197774b440',
        client_secret: 'cd99d852-f299-4281-8840-ac7be54455c6',
        gstin: '05AAACH6188F1ZM',
      };

      const response = await axios.default.post(
        `${baseURL}/ewaybillapi/v1.03/ewayapi/genewaybill`,
        body,
        {
          headers: header,
          params: {
            email: 'siddhant.shah@codeb.online',
          },
        },
      );
      return response;
    } catch (error) {
      return error;
    }
  }
}
