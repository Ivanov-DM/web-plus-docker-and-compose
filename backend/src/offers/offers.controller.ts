import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @AuthUser() user: User) {
    return this.offersService.create(createOfferDto, user.id);
  }

  @Get()
  getAll(@AuthUser() user: User) {
    return this.offersService.findMany({
      where: { user: { id: user.id } },
    });
  }

  @Get(':id')
  getById(@Param('id') id: number) {
    return this.offersService.findMany({
      where: { user: { id } },
    });
  }
}
