import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './typeorm';
import { UsersModule } from './users/users.module';
// import { MessagesModule } from './message/message.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomModule } from './other/custom.module';
import { GameModule } from './other/game.module';
import { RoomUserLinkModule } from './other/room-user-link.module';
import { UserFriendshipLinkModule } from './other/user-friendship-link.module';
import { GameUserLinkModule } from './other/game-user-link.module';
import { MessagesModule } from './other/message.module';
import { RoomModule } from './other/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_NAME'),
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MessagesModule,
    CustomModule,
    GameModule,
    RoomUserLinkModule,
    UserFriendshipLinkModule,
    GameUserLinkModule,
    MessagesModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
