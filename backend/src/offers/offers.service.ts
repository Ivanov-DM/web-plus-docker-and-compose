import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly userService: UsersService,
    private readonly wishService: WishesService,
    private dataSourse: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const { itemId, amount } = createOfferDto;
    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      const wish = await queryRunner.manager.findOne(Wish, {
        where: { id: itemId },
        relations: ['owner'],
      });
      if (wish.owner.id === userId) {
        throw new BadRequestException({
          message: 'Поддерживать собственный подарки запрещено',
        });
      }
      const raised = +wish.raised + amount;
      if (raised > wish.price) {
        throw new BadRequestException({
          message: `Сумма собранных средств не может превышать стоимость подарка`,
          raised: raised,
          price: wish.price,
        });
      }
      wish.raised = raised;
      await queryRunner.manager.update(Wish, itemId, { raised });
      await queryRunner.commitTransaction();
      return await this.offerRepository.save({
        ...createOfferDto,
        user,
        amount,
        item: wish,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      await queryRunner.release();
    }
  }

  findMany(query: FindManyOptions<Offer>) {
    return this.offerRepository.find(query);
  }
}
