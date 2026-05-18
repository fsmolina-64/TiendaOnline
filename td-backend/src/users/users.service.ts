import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { password, ...rest } = user;
    return rest;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { password, ...rest } = user;
    return rest;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
  async findAllAdmin(search?: string) {
  return this.prisma.user.findMany({
    where: {
      role: 'USER',
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      province: true,
      city: true,
      address: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { orders: true, favorites: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async findOneAdmin(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      province: true,
      city: true,
      address: true,
      reference: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      _count: {
        select: { orders: true, favorites: true },
      },
    },
  });

  if (!user) throw new NotFoundException('Usuario no encontrado');
  return user;
}

async toggleUser(userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  return this.prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
}
}