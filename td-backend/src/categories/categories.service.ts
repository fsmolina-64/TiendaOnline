import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }


  async findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);

    const exists = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (exists) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada');

    const data: any = {};

    if (dto.name) {
      data.name = dto.name;
      data.slug = this.generateSlug(dto.name);
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async toggle(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new NotFoundException('Categoría no encontrada');

    return this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
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