import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
