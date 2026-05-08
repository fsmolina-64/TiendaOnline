import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  stock!: number;

  @IsUUID()
  categoryId!: string;
}