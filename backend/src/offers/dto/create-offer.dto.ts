import { Column } from 'typeorm';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @Column({
    type: 'decimal',
    scale: 2,
  })
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;

  @IsNumber()
  @IsNotEmpty()
  itemId: number;
}
