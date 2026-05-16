import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':orderId')
  create(
    @Request() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, orderId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin() {
    return this.reviewsService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/stats')
  getStats() {
    return this.reviewsService.getStats();
  }
}