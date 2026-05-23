import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';


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

  @Delete('me')
  deleteAccount(@Request() req: any, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(req.user.id, dto);
  }
  @Get('addresses')
getAddresses(@Request() req: any) {
  return this.usersService.getAddresses(req.user.id);
}

@Post('addresses')
createAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
  return this.usersService.createAddress(req.user.id, dto);
}

@Patch('addresses/:id')
updateAddress(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
  return this.usersService.updateAddress(req.user.id, id, dto);
}

@Delete('addresses/:id')
deleteAddress(@Request() req: any, @Param('id') id: string) {
  return this.usersService.deleteAddress(req.user.id, id);
}

@Patch('addresses/:id/default')
setDefaultAddress(@Request() req: any, @Param('id') id: string) {
  return this.usersService.setDefaultAddress(req.user.id, id);
}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('showInactive') showInactive?: string,
  ) {
    return this.usersService.findAllAdmin(search, showInactive === 'true');
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