import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  getUser() {}

  async join(email: string, nickname: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email } });

    if (user) {
      // 이미 존재하는 유저 에러
      // throw new HttpException('이미 존재하는 사용자입니다.', 400);
      throw new UnauthorizedException('이미 존재하는 사용자입니다.');
    }

    const hashPassword = await bcrypt.hash(password, 12);

    try {
      const returned = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashPassword,
      });
      // throw new Error('롤백??');

      // 이렇게도 사용 가능
      // 1.
      // const workspaceMember = this.workspaceMembersRepository.create()

      // 2.
      // const workspaceMember = new WorkspaceMembers()
      // workspaceMember.UserId = returned.id
      // workspaceMember.WorkspaceId = 1

      await queryRunner.manager.getRepository(WorkspaceMembers).save({
        UserId: returned.id,
        WorkspaceId: 1,
      });

      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: returned.id,
        ChannelId: 1,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
