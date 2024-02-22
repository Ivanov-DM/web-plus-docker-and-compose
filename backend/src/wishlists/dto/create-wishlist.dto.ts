import { IsArray, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  @Length(0, 250)
  name: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsArray()
  @IsNotEmpty()
  itemsId: number[];
}
