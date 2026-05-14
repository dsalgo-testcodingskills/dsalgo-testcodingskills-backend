import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { SuperAdminService } from "./super-admin.service";
import { getallTestsubmissionsDTO } from "../test/DTO/test.dto";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("super-admin")
@UseGuards(AuthGuard)
@ApiBearerAuth("JWT")
@Controller("super-admin")
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post("getAllOrganizations")
  getAllOrganizations(@Body() body: getallTestsubmissionsDTO) {
    return this.superAdminService.getAllOrganizations(body);
  }

  @Get("organization/:id")
  getOrganizationById(@Param("id") id: string) {
    return this.superAdminService.getOrganizationById(id);
  }
}
