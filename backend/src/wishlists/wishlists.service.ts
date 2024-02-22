import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UsersService } from '../users/users.service';
import { WishesService } from '../wishes/wishes.service';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly userService: UsersService,
    private readonly wishService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, ownerId: number) {
    const { name, image, itemsId } = createWishlistDto;
    const owner = await this.userService.findById(ownerId);
    const wishes = await this.wishService.findMany({
      where: { id: In(itemsId) },
    });
    const wishlist = await this.wishlistRepository.create({
      name,
      image,
      owner,
      items: [...wishes],
    });
    return this.wishlistRepository.save(wishlist);
  }

  findMany(query: FindManyOptions<Wishlist>) {
    return this.wishlistRepository.find(query);
  }

  findOne(query: FindOneOptions<Wishlist>) {
    return this.wishlistRepository.findOneOrFail(query);
  }

  async updateOne(
    wishListId: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const { name, image, itemsId } = updateWishlistDto;
    let items;
    if (itemsId) {
      items = await this.wishService.findMany({
        where: { id: In(itemsId) },
      });
    }
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: wishListId },
      relations: ['owner', 'items'],
    });
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException({
        message: 'Вы не можете редактировать чужие списки подарков',
      });
    }
    return this.wishlistRepository.save({
      ...wishlist,
      ...(name && { name }),
      ...(image && { image }),
      ...(items && { items: [...wishlist.items, ...items] }),
    });
  }

  async removeOne(wishlistId: number, userId: number) {
    const deletedWishlist = await this.findOne({
      where: { id: wishlistId },
      relations: ['owner', 'items'],
    });
    if (deletedWishlist.owner.id !== userId) {
      throw new ForbiddenException({
        message: 'Вы не можете удалять чужие списки подарков',
      });
    }
    await this.wishlistRepository.delete(wishlistId);
    return deletedWishlist;
  }
}
