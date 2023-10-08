import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';
import { FriendRequestService } from 'src/friendrequest/friendrequest.service';
import { PlayerService } from 'src/player/player.service';
import { AchievementService } from 'src/achievement/achievement.service';

@Module({
  providers: [UsersService, UsersGateway, FriendshipService, BlockService, FriendRequestService, PlayerService, AchievementService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule { }
