import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

async addImages(productId: string, files: Express.Multer.File[]) {
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) throw new NotFoundException('Producto no encontrado');

  // Validar que files exista y no esté vacío
  if (!files || files.length === 0) {
    throw new BadRequestException('No se enviaron imágenes');
  }

  const startOrder = product.images.length;

  const images = await Promise.all(
    files.map((file, index) =>
      this.prisma.productImage.create({
        data: {
          productId,
          url: `/uploads/products/${file.filename}`,
          order: startOrder + index,
        },
      }),
    ),
  );

  return {
    message: `${images.length} imagen(es) subida(s) correctamente`,
    images,
  };
}

  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) throw new NotFoundException('Imagen no encontrada');

    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });

    return { message: 'Imagen eliminada correctamente' };
  }

  async reorderImages(productId: string, imageIds: string[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    await Promise.all(
      imageIds.map((id, index) =>
        this.prisma.productImage.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });
  }
  async uploadAvatar(userId: string, file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No se envió ninguna imagen');
  }

  // Obtener avatar anterior para eliminarlo
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  // Eliminar archivo anterior si existe
  if (user?.avatar) {
    const oldPath = path.join(process.cwd(), user.avatar);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const avatarUrl = `/uploads/avatars/${file.filename}`;

  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });

  const { password, ...rest } = updated;
  return rest;
}
}