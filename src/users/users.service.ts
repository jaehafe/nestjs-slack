import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  getUser() {}

  async join(email: string, nickname: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      // 이미 존재하는 유저 에러
      // throw new HttpException('이미 존재하는 사용자입니다.', 400);
      throw new UnauthorizedException('이미 존재하는 사용자입니다.');
    }

    const hashPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashPassword,
    });
  }
}
