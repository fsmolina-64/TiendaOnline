import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StockMovementDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}