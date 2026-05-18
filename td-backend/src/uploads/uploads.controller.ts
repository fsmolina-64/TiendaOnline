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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  // Avatar — cualquier usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(new BadRequestException('Solo se permiten imágenes jpg, png, webp'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadAvatar(req.user.id, file);
  }

  // Productos — solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('products/:productId')
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(new BadRequestException('Solo se permiten imágenes jpg, png, webp'), false);
        }
        cb(null, true);
      },
    }),
  )
  addImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
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