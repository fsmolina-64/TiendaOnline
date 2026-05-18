import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { UpdateStatusDto } from './dto/update-status.dto';

const IVA = 0.15;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async checkout(userId: string) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new BadRequestException(
          `El producto "${item.product.name}" ya no está disponible`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${item.product.name}". Disponible: ${product.stock}`,
        );
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
const newOrder = await tx.order.create({
  data: {
    userId,
    status: 'PAID',
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
    province: user.province,
    city: user.city,
    address: user.address,
    reference: user.reference,
  },
});

      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.originalPrice,
            discountPct: item.discountPct,
            finalPrice: item.finalPrice,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            reason: `Venta - Orden ${newOrder.id}`,
          },
        });
      }

      const invoiceNumber = `INV-${Date.now()}`;

      await tx.invoice.create({
        data: {
          orderId: newOrder.id,
          number: invoiceNumber,
          subtotal: cart.subtotal,
          tax: cart.tax,
          total: cart.total,
        },
      });

      return newOrder;
    });

    await this.cartService.clearCart(userId);
    return this.findOne(userId, order.id);
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
          },
        },
        invoice: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
          },
        },
        invoice: true,
        reviews: true,
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new NotFoundException('Orden no encontrada');

    return order;
  }

  async cancelOrder(userId: string, orderId: string, cancelReason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new ForbiddenException('No tienes permiso');
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Solo puedes cancelar órdenes pendientes');
    }
    if (!cancelReason || cancelReason.trim().length < 5) {
      throw new BadRequestException('Debes ingresar un motivo de cancelación');
    }

    const items = await this.prisma.orderItem.findMany({ where: { orderId } });

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'MANUAL_ADJUSTMENT',
            quantity: item.quantity,
            reason: `Cancelación - Orden ${orderId}`,
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelReason },
      });
    });

    return this.findOne(userId, orderId);
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
        invoice: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: string, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const items = await this.prisma.orderItem.findMany({ where: { orderId } });

      await this.prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'MANUAL_ADJUSTMENT',
              quantity: item.quantity,
              reason: `Cancelación admin - Orden ${orderId}`,
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: dto.status,
            cancelReason: dto.cancelReason,
          },
        });
      });

      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, invoice: true, reviews: true },
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { items: true, invoice: true, reviews: true },
    });
  }
}