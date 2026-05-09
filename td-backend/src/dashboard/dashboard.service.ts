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
    ] = await Promise.all([
      // Total usuarios activos
      this.prisma.user.count({
        where: { isActive: true, role: 'USER' },
      }),

      // Total productos activos
      this.prisma.product.count({
        where: { isActive: true },
      }),

      // Total pedidos
      this.prisma.order.count(),

      // Pedidos pagados para calcular ventas totales
      this.prisma.order.findMany({
        where: { status: 'PAID' },
        select: { total: true },
      }),

      // Productos agotados
      this.prisma.product.findMany({
        where: { isActive: true, stock: 0 },
        select: {
          id: true,
          name: true,
          stock: true,
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),

      // Productos con stock bajo
      this.prisma.product.findMany({
        where: {
          isActive: true,
          stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
        },
        select: {
          id: true,
          name: true,
          stock: true,
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy: { stock: 'asc' },
      }),

      // Últimos 5 pedidos
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const totalSales = paidOrders.reduce(
      (acc, order) => acc + Number(order.total),
      0,
    );

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100,
      },
      outOfStockProducts,
      lowStockProducts,
      recentOrders,
    };
  }
}