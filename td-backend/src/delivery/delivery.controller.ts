import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsUUID } from 'class-validator';

class EstimateDto {
  @IsString()
  @IsUUID()
  addressId!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post('estimate')
  estimate(@Body() dto: EstimateDto) {
    return this.deliveryService.estimate(dto.addressId);
  }
}
