import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findById(id: number) {
    return this.workspacesRepository.findOne({ where: { id } });
  }

  async findMyWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [{ UserId: myId }],
      },
    });
  }

  async createWorkspace(name: string, url: string, myId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const returned = await queryRunner.manager
        .getRepository(Workspaces)
        .save({
          name,
          url,
          OwnerId: myId,
        });

      await queryRunner.manager.getRepository(WorkspaceMembers).save({
        UserId: myId,
        WorkspaceId: returned.id,
      });

      const channelReturned = await queryRunner.manager
        .getRepository(Channels)
        .save({
          name: '일반',
          WorkspaceId: returned.id,
        });

      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: myId,
        ChannelId: channelReturned.id,
      });

      await queryRunner.commitTransaction();

      // const workspace = new Workspaces();
      // workspace.name = name;
      // workspace.url = url;
      // workspace.OwnerId = myId;
      // const returned = await this.workspacesRepository.save(workspace);

      // const workspaceMember = new WorkspaceMembers();
      // workspaceMember.UserId = myId;
      // workspaceMember.WorkspaceId = returned.id;
      // await this.workspaceMembersRepository.save(workspaceMember);

      // const channel = new Channels();
      // channel.name = '일반';
      // channel.WorkspaceId = returned.id;
      // const channelReturned = await this.channelsRepository.save(channel);

      // const channelMember = new ChannelMembers();
      // channelMember.UserId = myId;
      // channelMember.ChannelId = channelReturned.id;
      // await this.channelMembersRepository.save(channelMember);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMembers(url: string) {
    return (
      this.usersRepository
        .createQueryBuilder('user') // user 테이블에 대한 별칭
        .innerJoin('user.WorkspaceMembers', 'members')
        // 4번째 parameter가 3번째 :url로 들어감, sql injection 방어하기 위한 방법 중 하나
        .innerJoin('members.Workspace', 'workspace', 'workspace.url = :url', {
          url,
        })
        .getMany()
    );

    // ManyToMany일 경우
    // this.usersRepository
    //   .createQueryBuilder('user')
    //   .innerJoin('user.Workspaces', 'workspaces');
  }

  async createWorkspaceMembers(url: string, email: string) {
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
      relations: ['Channels'],
    });

    // queryBuilder 버전
    this.workspacesRepository
      .createQueryBuilder('workspaces')
      // typeorm은 innerJoin 하면 join한 테이블은 가져오지 않는데,
      // innerJoinAndSelect을 하면 join한 테이블을 다 가져온다.
      .innerJoinAndSelect('workspaces.Channels', 'channels')
      .getOne();

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;

    const workspaceMember = new WorkspaceMembers();
    workspaceMember.WorkspaceId = workspace.id;
    workspaceMember.UserId = user.id;
    await this.workspaceMembersRepository.save(workspaceMember);

    const channelMember = new ChannelMembers();
    channelMember.ChannelId = workspace.Channels.find(
      (v) => v.name === '일반',
    ).id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);
  }

  // transaction
  // async createWorkspaceMembers(url: string, email: string) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const workspace = await queryRunner.manager.findOne(Workspaces, {
  //       where: { url },
  //       relations: ['Channels'],
  //     });

  //     const user = await queryRunner.manager.findOne(Users, { where: { email } });
  //     if (!user) return null;

  //     const workspaceMember = new WorkspaceMembers();
  //     workspaceMember.WorkspaceId = workspace.id;
  //     workspaceMember.UserId = user.id;
  //     await queryRunner.manager.save(workspaceMember);

  //     const channelMember = new ChannelMembers();
  //     channelMember.ChannelId = workspace.Channels.find(
  //       (v) => v.name === '일반',
  //     ).id;
  //     channelMember.UserId = user.id;
  //     await queryRunner.manager.save(channelMember);

  //     await queryRunner.commitTransaction();
  //   } catch (error) {
  //     console.error(error);
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async getWorkspaceMember(url: string, id: number) {
    return (
      this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        // query문이 복잡해지면 아래와 같이
        // .where('UPPERCASE(user.id) = :id AND user.name', { id, name })
        // .andWhere('user.name = :name', { name })
        .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url = :url', {
          url,
        })
        .getOne()
    );
  }
}
