import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}

  async getHello() {
    this.usersService.getUser();
    // this.getWow();
    return process.env.SECRET;
  }

  // async getHello() {
  //   return this.configService.get('DATABASE_USER');
  //   // process.env.DATABASE_USER
  // }
}
