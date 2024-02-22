import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { WishesService } from '../wishes/wishes.service';
import { FindUserDto } from './dto/find-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishService: WishesService,
  ) {}

  @Get('me')
  async getOwn(@AuthUser() user: User): Promise<User> {
    return this.usersService.findOne({
      where: { id: user.id },
    });
  }

  @Patch('me')
  async updateOwn(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { id } = user;
    return this.usersService.updateOne(id, updateUserDto);
  }

  @Get('me/wishes')
  async getOwnWishes(@AuthUser() user: User): Promise<Wish[]> {
    return await this.wishService.findMany({
      where: { owner: { id: user.id } },
      relations: ['owner'],
    });
  }

  @Get(':username')
  getByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findOne({
      where: { username },
    });
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') name: string): Promise<Wish[]> {
    return await this.wishService.findMany({
      where: { owner: { username: name } },
      relations: ['owner'],
    });
  }

  @Post('find')
  findUser(@Body() findUserDto: FindUserDto): Promise<User[]> {
    return this.usersService.findMany({
      where: [{ email: findUserDto.query }, { username: findUserDto.query }],
    });
  }
}
