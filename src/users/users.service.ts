import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
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
    const returned = await this.usersRepository.save({
      email,
      nickname,
      password: hashPassword,
    });

    // 이렇게도 사용 가능
    // 1.
    // const workspaceMember = this.workspaceMembersRepository.create()

    // 2.
    // const workspaceMember = new WorkspaceMembers()
    // workspaceMember.UserId = returned.id
    // workspaceMember.WorkspaceId = 1

    await this.workspaceMembersRepository.save({
      UserId: returned.id,
      WorkspaceId: 1,
    });

    await this.channelMembersRepository.save({
      UserId: returned.id,
      ChannelId: 1,
    });

    return true;
  }
}
