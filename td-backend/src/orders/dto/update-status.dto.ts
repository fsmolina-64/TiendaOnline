import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}