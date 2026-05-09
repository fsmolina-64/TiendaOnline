import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post(':productId')
  addItem(
    @Request() req: any,
    @Param('productId') productId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(req.user.id, productId, dto);
  }

  @Patch(':productId')
  updateItem(
    @Request() req: any,
    @Param('productId') productId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.updateItem(req.user.id, productId, dto);
  }

  @Delete('clear')
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  @Delete(':productId')
  removeItem(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(req.user.id, productId);
  }
}