import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly userService: UsersService,
  ) {}

  async create(createWishDto: CreateWishDto, ownerId: number) {
    const owner = await this.userService.findById(ownerId);
    const wish = await this.wishRepository.create({ ...createWishDto, owner });
    return this.wishRepository.save(wish);
  }

  findOne(query: FindOneOptions<Wish>) {
    return this.wishRepository.findOneOrFail(query);
  }

  findMany(query: FindManyOptions<Wish>) {
    return this.wishRepository.find(query);
  }

  async removeOne(wishId: number, userId: number) {
    const deletedWish = await this.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (deletedWish.owner.id !== userId) {
      throw new ForbiddenException({
        message: 'Удаление подарков других пользователей запрещено',
      });
    }
    if (+deletedWish.raised !== 0) {
      throw new BadRequestException({
        message: 'Удаление запрещено, на этот подарок уже начат сбор средств',
      });
    }
    await this.wishRepository.delete({ id: wishId });
    return deletedWish;
  }

  async copyOne(wishId: number, userId: number) {
    const currentWish = await this.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (currentWish.owner.id === userId) {
      throw new BadRequestException({
        message: 'Вы не можете копировать собственный подарок',
      });
    }
    const userWishes = await this.findMany({
      where: { owner: { id: userId } },
    });
    const isContainWish = userWishes.some(
      (wish) => wish.name === currentWish.name,
    );
    if (isContainWish) {
      throw new ForbiddenException({
        message: 'Вы уже копировали себе этот подарок',
      });
    }
    const { name, link, image, price, description } = currentWish;
    await this.wishRepository.increment({ id: wishId }, 'copied', 1);
    const newWish = await this.create(
      {
        name,
        link,
        image,
        price,
        description,
      },
      userId,
    );
    return this.wishRepository.save(newWish);
  }

  async updateOne(
    wishId: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    const currentWish = await this.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (currentWish.owner.id !== userId) {
      throw new BadRequestException({
        message: 'Редактирование подарков других пользователей запрещено',
      });
    }
    if (+currentWish.raised !== 0) {
      throw new BadRequestException({
        message:
          'Редактирование запрещено, на этот подарок уже начат сбор средств',
      });
    }
    return this.wishRepository.save({ ...currentWish, ...updateWishDto });
  }
}
