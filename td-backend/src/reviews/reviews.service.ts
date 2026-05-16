import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, orderId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new ForbiddenException('No tienes permiso');

    if (dto.type === 'PAYMENT' && order.status !== 'PAID' && order.status !== 'DELIVERED') {
      throw new BadRequestException('Solo puedes valorar el pago cuando la orden esté pagada');
    }

    if (dto.type === 'DELIVERY' && order.status !== 'DELIVERED') {
      throw new BadRequestException('Solo puedes valorar la entrega cuando el producto haya sido entregado');
    }

    const existing = await this.prisma.orderReview.findUnique({
      where: {
        orderId_userId_type: { orderId, userId, type: dto.type },
      },
    });

    if (existing) throw new BadRequestException('Ya valoraste este pedido');

    return this.prisma.orderReview.create({
      data: {
        orderId,
        userId,
        type: dto.type,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.orderReview.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, total: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const reviews = await this.prisma.orderReview.findMany();
    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
      : 0;

    const paymentReviews = reviews.filter((r) => r.type === 'PAYMENT');
    const deliveryReviews = reviews.filter((r) => r.type === 'DELIVERY');

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      payment: {
        total: paymentReviews.length,
        avg: paymentReviews.length > 0
          ? Math.round(paymentReviews.reduce((acc, r) => acc + r.rating, 0) / paymentReviews.length * 10) / 10
          : 0,
      },
      delivery: {
        total: deliveryReviews.length,
        avg: deliveryReviews.length > 0
          ? Math.round(deliveryReviews.reduce((acc, r) => acc + r.rating, 0) / deliveryReviews.length * 10) / 10
          : 0,
      },
    };
  }
}