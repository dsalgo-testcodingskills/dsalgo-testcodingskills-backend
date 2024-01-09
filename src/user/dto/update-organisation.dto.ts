import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateOrganisationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  organizationName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  organizationLogo: string;
}