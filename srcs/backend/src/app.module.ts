import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { GameController } from './game/game.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { MessagesModule } from './message/message.module';
import { AchievementModule } from './achievement/achievement.module';
import { BlockModule } from './block/block.module';
import { CustomModule } from './custom/custom.module';
import { FriendRequestModule } from './friendrequest/friendrequest.module';
import { FriendshipModule } from './friendship/friendship.module';
import { MemberModule } from './member/member.module';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GameModule,
    MessagesModule,
    UsersModule,
    AuthModule,
    AchievementModule,
    BlockModule,
    CustomModule,
    FriendRequestModule,
    FriendshipModule,
    MemberModule,
    PlayerModule,
    RoomModule,
    DevtoolsModule.register({
      port: 3001,
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule { }
