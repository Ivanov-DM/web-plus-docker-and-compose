import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class SigninUserDto {
  @IsString()
  @Length(1, 64)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
