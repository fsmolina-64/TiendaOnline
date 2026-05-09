import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementDto } from './dto/stock-movement.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async addStock(productId: string, dto: StockMovementDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          productId,
          type: 'ADD',
          quantity: dto.quantity,
          reason: dto.reason ?? 'Ingreso de stock',
        },
      });

      return tx.product.update({
        where: { id: productId },
        data: { stock: { increment: dto.quantity } },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });
    });

    return {
      message: `Stock actualizado correctamente`,
      product: updated,
    };
  }

  async adjustStock(productId: string, dto: StockMovementDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const newStock = product.stock - dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `No puedes reducir más de lo disponible. Stock actual: ${product.stock}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          productId,
          type: 'MANUAL_ADJUSTMENT',
          quantity: dto.quantity,
          reason: dto.reason ?? 'Ajuste manual',
        },
      });

      return tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: dto.quantity } },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });
    });

    return {
      message: 'Ajuste de stock realizado correctamente',
      product: updated,
    };
  }

  async getMovements(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const movements = await this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      product,
      movements,
    };
  }
}