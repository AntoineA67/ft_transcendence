import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { AchievementModule } from './achievement/achievement.module';
import { BlockModule } from './block/block.module';
import { GameSettingsModule } from './gameSettings/gameSettings.module';
import { FriendRequestModule } from './friendrequest/friendrequest.module';
import { FriendshipModule } from './friendship/friendship.module';
import { PlayerModule } from './player/player.module';
import { RoomModule } from './room/room.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GameModule,
    UsersModule,
    AuthModule,
    AchievementModule,
    BlockModule,
    GameSettingsModule,
    FriendRequestModule,
    FriendshipModule,
    PlayerModule,
    RoomModule,
    ProfileModule,
    DevtoolsModule.register({
      port: 4001,
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
