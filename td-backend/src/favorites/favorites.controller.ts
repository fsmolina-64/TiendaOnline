import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Post(':productId')
  add(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.add(req.user.id, productId);
  }

  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.remove(req.user.id, productId);
  }
}