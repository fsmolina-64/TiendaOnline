import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Request() req: any) {
    return this.ordersService.checkout(req.user.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.id, id);
  }

  // Admin
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}