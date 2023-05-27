import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

// const getEnv = async () => {
//   const res = await axios.get('/비밀키요청')
//   return {
//     DATABASE_USER: 'root',
//     DATABASE_PASSWORD: '123456789',
//   };
// };

@Module({
  // imports: [ConfigModule.forRoot({ isGlobal: true, load: [getEnv] })],
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService, ConfigService], // 의존성 주입할 서비스 등록
})
export class AppModule {}
