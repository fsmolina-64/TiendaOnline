import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      paidOrders,
      outOfStockProducts,
      lowStockProducts,
      recentOrders,
      recentReviews,
      allReviews,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true, role: 'USER' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.findMany({
        where: { status: 'PAID' },
        select: { total: true },
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: 0 },
        select: { id: true, name: true, stock: true },
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.orderReview.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          order: { select: { id: true, total: true, status: true } },
        },
      }),
      this.prisma.orderReview.findMany(),
    ]);

    const totalSales = paidOrders.reduce(
      (acc, order) => acc + Number(order.total), 0,
    );

    const paymentReviews = allReviews.filter((r) => r.type === 'PAYMENT');
    const deliveryReviews = allReviews.filter((r) => r.type === 'DELIVERY');

    const avgPayment = paymentReviews.length > 0
      ? Math.round(paymentReviews.reduce((acc, r) => acc + r.rating, 0) / paymentReviews.length * 10) / 10
      : 0;

    const avgDelivery = deliveryReviews.length > 0
      ? Math.round(deliveryReviews.reduce((acc, r) => acc + r.rating, 0) / deliveryReviews.length * 10) / 10
      : 0;

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100,
      },
      reviews: {
        avgPayment,
        avgDelivery,
        totalReviews: allReviews.length,
        recent: recentReviews,
      },
      outOfStockProducts,
      lowStockProducts,
      recentOrders,
    };
  }
}