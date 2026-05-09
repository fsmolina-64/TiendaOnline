import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

const IVA = 0.15;

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
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
    });

    const itemsWithPrices = items.map((item) => {
      const originalPrice = Number(item.product.price);
      const promotion = item.product.promotions?.[0];
      const discountPct = promotion ? Number(promotion.discount) : 0;
      const finalPrice = originalPrice * (1 - discountPct / 100);
      const lineTotal = Math.round(finalPrice * item.quantity * 100) / 100;

      return {
        ...item,
        originalPrice,
        discountPct,
        finalPrice: Math.round(finalPrice * 100) / 100,
        lineTotal,
      };
    });

    const subtotal = itemsWithPrices.reduce((acc, i) => acc + i.lineTotal, 0);
    const tax = Math.round(subtotal * IVA * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
      cartId: cart.id,
      items: itemsWithPrices,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
    };
  }

  async addItem(userId: string, productId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${product.stock}`,
        );
      }

      return this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: newQuantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: dto.quantity,
      },
    });
  }

  async updateItem(userId: string, productId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) throw new NotFoundException('Producto no está en el carrito');

    return this.prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) throw new NotFoundException('Producto no está en el carrito');

    await this.prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    return { message: 'Producto eliminado del carrito' };
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Carrito vaciado' };
  }

  // Obtiene el carrito del usuario o lo crea si no existe
  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }
}