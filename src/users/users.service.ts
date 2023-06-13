import { HttpException, Injectable } from '@nestjs/common';
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
    if (!email) {
      // 이메일 없다면 에러
      throw new HttpException('이메일이 없습니다.', 400);
    }
    if (!nickname) {
      throw new HttpException('닉네임이 없습니다.', 400);
    }
    if (!password) {
      throw new HttpException('잘못된 비밀번호입니다.', 400);
    }
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      // 이미 존재하는 유저 에러
      // throw new HttpException('이미 존재하는 사용자입니다.', 400);
      throw new HttpException(
        { message: '이미 존재하는 사용자입니다.', statusCode: 400 },
        400,
      );
    }

    const hashPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashPassword,
    });
  }
}
