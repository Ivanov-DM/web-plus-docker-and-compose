import { PartialType, PickType } from '@nestjs/mapped-types';
import { Wish } from '../entities/wish.entity';

export class UpdateWishDto extends PartialType(
  PickType(Wish, ['description', 'price']),
) {}
