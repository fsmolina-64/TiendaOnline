import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  label: string = 'Casa';

  @IsString()
  province!: string;

  @IsString()
  city!: string;

  @IsString()
  address!: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}