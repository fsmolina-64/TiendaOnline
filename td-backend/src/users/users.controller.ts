import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('change-password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  // Rutas admin
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin(@Query('search') search?: string) {
    return this.usersService.findAllAdmin(search);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.usersService.findOneAdmin(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/toggle')
  toggleUser(@Param('id') id: string) {
    return this.usersService.toggleUser(id);
  }
}