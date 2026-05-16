import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewType {
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
}

export class CreateReviewDto {
  @IsEnum(ReviewType)
  type!: ReviewType;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}