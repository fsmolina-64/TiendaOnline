import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    // 1. Obtener carrito con precios calculados
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // 2. Obtener datos del usuario para snapshot de dirección
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 3. Validar stock de todos los productos antes de crear la orden
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

    // 4. Todo en una transacción
    const order = await this.prisma.$transaction(async (tx) => {
      // Crear la orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal: cart.subtotal,
          tax: cart.tax,
          total: cart.total,
          // Snapshot de dirección
          province: user.province,
          city: user.city,
          address: user.address,
          reference: user.reference,
        },
      });

      // Crear order items y descontar stock
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

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        // Registrar movimiento de stock
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            reason: `Venta - Orden ${newOrder.id}`,
          },
        });
      }

      // Generar número de factura
      const invoiceNumber = `INV-${Date.now()}`;

      // Crear factura
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

    // 5. Vaciar carrito después de la transacción
    await this.cartService.clearCart(userId);

    // 6. Retornar orden completa
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
      },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    // Usuario solo puede ver sus propias órdenes
    if (order.userId !== userId) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  // Admin
  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: string, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    // Si se cancela la orden, devolver stock
    if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const items = await this.prisma.orderItem.findMany({
        where: { orderId },
      });

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
          data: { status: dto.status },
        });
      });

      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, invoice: true },
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { items: true, invoice: true },
    });
  }
}