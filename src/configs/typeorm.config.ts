import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { DMs } from 'src/entities/DMs';
import { Mentions } from 'src/entities/Mentions';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456789',
  database: 'slack',
  // username: process.env.DATABASE_USERNAME,
  // password: process.env.DATABASE_PASSWORD,
  // database: process.env.DATABASE_DATABASE,
  // entities: [__dirname + '/src/entities/*.{js,ts}'],
  entities: [
    ChannelChats,
    ChannelMembers,
    Channels,
    DMs,
    Mentions,
    Users,
    WorkspaceMembers,
    Workspaces,
  ],
  // autoLoadEntities: true,
  synchronize: false,
  logging: true,
  keepConnectionAlive: true,
  charset: 'utf8mb4',
};
