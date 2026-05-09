import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            promotions: {
              where: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const exists = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (exists) throw new ConflictException('El producto ya está en favoritos');

    return this.prisma.favorite.create({
      data: { userId, productId },
    });
  }

  async remove(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!favorite) throw new NotFoundException('Favorito no encontrado');

    await this.prisma.favorite.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { message: 'Producto eliminado de favoritos' };
  }
}