import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Column } from 'typeorm';

export class CreateWishDto {
  @Length(1, 250)
  @IsString()
  name: string;

  @IsNotEmpty()
  link: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @Column({
    type: 'decimal',
    scale: 2,
  })
  @IsNotEmpty()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
