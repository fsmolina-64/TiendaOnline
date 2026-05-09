import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { StockMovementDto } from './dto/stock-movement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post(':productId/add')
  addStock(
    @Param('productId') productId: string,
    @Body() dto: StockMovementDto,
  ) {
    return this.stockService.addStock(productId, dto);
  }

  @Post(':productId/adjust')
  adjustStock(
    @Param('productId') productId: string,
    @Body() dto: StockMovementDto,
  ) {
    return this.stockService.adjustStock(productId, dto);
  }

  @Get(':productId/movements')
  getMovements(@Param('productId') productId: string) {
    return this.stockService.getMovements(productId);
  }
}