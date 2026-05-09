import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promotion.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(productId: string, dto: CreatePromotionDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    this.validateDates(dto.startDate, dto.endDate);

    return this.prisma.promotion.create({
      data: {
        productId,
        discount: dto.discount,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
      },
      include: {
        product: {
          select: { id: true, name: true, price: true },
        },
      },
    });
  }

  async update(id: string, dto: Partial<CreatePromotionDto>) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) throw new NotFoundException('Promoción no encontrada');

    const startDate = dto.startDate ?? promotion.startDate.toISOString();
    const endDate = dto.endDate ?? promotion.endDate.toISOString();

    this.validateDates(startDate, endDate);

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...(dto.discount !== undefined && { discount: dto.discount }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        product: {
          select: { id: true, name: true, price: true },
        },
      },
    });
  }

  async toggle(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) throw new NotFoundException('Promoción no encontrada');

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: !promotion.isActive },
    });
  }

  async remove(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) throw new NotFoundException('Promoción no encontrada');

    await this.prisma.promotion.delete({ where: { id } });

    return { message: 'Promoción eliminada correctamente' };
  }

  private validateDates(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor a la fecha de inicio',
      );
    }
  }
}