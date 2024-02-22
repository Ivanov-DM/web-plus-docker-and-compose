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
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { AuthUser } from '../../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Wish } from './entities/wish.entity';
import { UpdateWishDto } from './dto/update-wish.dto';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user: User) {
    return this.wishesService.create(createWishDto, user.id);
  }

  @Get('last')
  getLastWishes(): Promise<Wish[]> {
    return this.wishesService.findMany({
      relations: ['owner', 'offers'],
      order: {
        copied: 'DESC',
      },
      take: 20,
    });
  }

  @Get('top')
  getTopWishes(): Promise<Wish[]> {
    return this.wishesService.findMany({
      relations: ['owner', 'offers'],
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getWishById(@Param('id') id: number) {
    return this.wishesService.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateWishById(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    return this.wishesService.updateOne(id, updateWishDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeWishById(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.removeOne(id, user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copyWishById(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.copyOne(id, user.id);
  }
}
