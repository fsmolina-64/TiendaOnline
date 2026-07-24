import {
  Controller,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tienda-online/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any,
});

const productsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tienda-online/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any,
});

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: avatarStorage }))
  uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se envió ninguna imagen o formato inválido');
    return this.uploadsService.uploadAvatar(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('products/:productId')
  @UseInterceptors(FilesInterceptor('images', 3, { storage: productsStorage }))
  addImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No se enviaron imágenes o formato inválido');
    return this.uploadsService.addImages(productId, files);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: string) {
    return this.uploadsService.removeImage(imageId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('products/:productId/reorder')
  reorderImages(
    @Param('productId') productId: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.uploadsService.reorderImages(productId, body.imageIds);
  }
}