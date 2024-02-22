import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashValue } from '../../helpers/hash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  isExistByUsername(username: string) {
    return this.userRepository.exist({
      where: { username },
    });
  }

  isExistByEmail(email: string) {
    return this.userRepository.exist({
      where: { email },
    });
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { password, username, email } = createUserDto;
    if (await this.isExistByUsername(username)) {
      throw new BadRequestException({
        message: 'Пользователь с таким именем уже существует',
      });
    }
    if (await this.isExistByEmail(email)) {
      throw new BadRequestException({
        message: 'Пользователь с таким email уже существует',
      });
    }
    const user = await this.userRepository.create({
      ...createUserDto,
      password: await hashValue(password),
    });
    return this.userRepository.save(user);
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOne(query: FindOneOptions<User>) {
    return this.userRepository.findOneOrFail(query);
  }

  findMany(query: FindManyOptions<User>) {
    return this.userRepository.find(query);
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    const { password, username, email } = updateUserDto;
    if (username) {
      if (await this.isExistByUsername(username)) {
        throw new BadRequestException({
          message: 'Пользователь с таким именем уже существует',
        });
      }
    }
    if (email) {
      if (await this.isExistByEmail(email)) {
        throw new BadRequestException({
          message: 'Пользователь с таким email уже существует',
        });
      }
    }
    const user = await this.findById(id);
    if (password) {
      updateUserDto.password = await hashValue(password);
    }
    return this.userRepository.save({ ...user, ...updateUserDto });
  }

  create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
