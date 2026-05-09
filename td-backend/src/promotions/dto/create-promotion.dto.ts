import {
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsBoolean,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discount!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}