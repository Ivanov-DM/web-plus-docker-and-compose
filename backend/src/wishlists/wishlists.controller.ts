import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { AuthUser } from '../../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getAll() {
    return this.wishlistsService.findMany({
      relations: ['owner', 'items'],
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishlistDto: CreateWishlistDto, @AuthUser() user: User) {
    return this.wishlistsService.create(createWishlistDto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getById(@Param('id') id: number) {
    return this.wishlistsService.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateById(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @AuthUser() user: User,
  ) {
    return this.wishlistsService.updateOne(id, updateWishlistDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeById(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishlistsService.removeOne(id, user.id);
  }
}
