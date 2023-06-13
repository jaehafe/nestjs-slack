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
}
