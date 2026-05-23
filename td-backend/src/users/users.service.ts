import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

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
async findAllAdmin(search?: string, showInactive?: boolean) {
  return this.prisma.user.findMany({
    where: {
      role: 'USER',
      ...(!showInactive && { isActive: true }),
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
      cedula: true,
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
      cedula: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      addresses: true,
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
async deleteAccount(userId: string, dto: DeleteAccountDto) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

  await this.prisma.user.delete({ where: { id: userId } });
  return { message: 'Cuenta eliminada' };
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

async getAddresses(userId: string) {
  return this.prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  });
}

async createAddress(userId: string, dto: CreateAddressDto) {
  if (dto.isDefault) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  return this.prisma.address.create({
    data: { ...dto, userId },
  });
}

async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
  const address = await this.prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundException('Dirección no encontrada');

  if (dto.isDefault) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return this.prisma.address.update({
    where: { id: addressId },
    data: dto,
  });
}

async deleteAddress(userId: string, addressId: string) {
  const address = await this.prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundException('Dirección no encontrada');

  await this.prisma.address.delete({ where: { id: addressId } });
  return { message: 'Dirección eliminada' };
}

async setDefaultAddress(userId: string, addressId: string) {
  const address = await this.prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new NotFoundException('Dirección no encontrada');

  await this.prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return this.prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}
}