import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterProductDto) {
    const { categoryId, minPrice, maxPrice, search } = filters;

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.applyPromotion(p));
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.applyPromotion(product);
  }

  async findAllAdmin() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        promotions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.applyPromotion(p));
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId, isActive: true },
    });

    if (!category) {
      throw new BadRequestException('Categoría no válida o deshabilitada');
    }

    const slug = this.generateSlug(dto.name);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const data: any = { ...dto };

    if (dto.name) {
      data.slug = this.generateSlug(dto.name);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId, isActive: true },
      });
      if (!category) {
        throw new BadRequestException('Categoría no válida o deshabilitada');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, images: true },
    });
  }

  async toggle(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
  }

  // Calcula precio final con promoción activa
  private applyPromotion(product: any) {
    const activePromotion = product.promotions?.[0] ?? null;

    const originalPrice = Number(product.price);
    let finalPrice = originalPrice;
    let discountPct = 0;

    if (activePromotion) {
      discountPct = Number(activePromotion.discount);
      finalPrice = originalPrice * (1 - discountPct / 100);
      finalPrice = Math.round(finalPrice * 100) / 100;
    }

    return {
      ...product,
      originalPrice,
      finalPrice,
      discountPct,
      hasPromotion: !!activePromotion,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}