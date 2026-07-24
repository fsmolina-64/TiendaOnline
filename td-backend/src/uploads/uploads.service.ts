import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cloudinary } from './cloudinary.config';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) { }

  async addImages(productId: string, files: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      // Destroy uploaded files since product doesn't exist
      for (const file of files) {
        if (file.filename) await cloudinary.uploader.destroy(file.filename);
      }
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.images.length + files.length > 3) {
      // Destroy uploaded files since limit exceeded
      for (const file of files) {
        if (file.filename) await cloudinary.uploader.destroy(file.filename);
      }
      throw new BadRequestException(`El producto ya tiene ${product.images.length} imágenes. Máximo permitido: 3`);
    }

    const startOrder = product.images.length;

    const images = await Promise.all(
      files.map((file, index) =>
        this.prisma.productImage.create({
          data: {
            productId,
            url: file.path, // Cloudinary URL
            publicId: file.filename, // Cloudinary public_id
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

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId).catch(console.error);
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    if (user?.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(console.error);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: file.path, // Cloudinary URL
        avatarPublicId: file.filename, // Cloudinary public_id
      },
    });

    const { password, ...rest } = updated;
    return rest;
  }
}