import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class customeDataDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  email: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  model: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  year: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  designData: string;
  @ApiProperty({ required: false })
  referalCode: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  image: Array<string>;
}

export class motorDesignDataDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  email: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  company: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  rnumber: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  designData: string;
}

export class contactDataDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  fname: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  lname: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  phone: number;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  email: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  message: string;
}

export class imageDto {
  @ApiProperty()
  @IsNotEmpty()
  inqueryId: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  image: string;
}
