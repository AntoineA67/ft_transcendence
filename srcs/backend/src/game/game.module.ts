import { Module } from '@nestjs/common';
import { GamesService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { GameSettingsService } from 'src/gameSettings/gameSettings.service';
import { ProfileService } from 'src/profile/profile.service';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendRequestService } from 'src/friendrequest/friendrequest.service';
import { BlockService } from 'src/block/block.service';
import { PlayerService } from 'src/player/player.service';
import { AchievementService } from 'src/achievement/achievement.service';

@Module({
  imports: [PrismaModule],
  providers: [GamesService, GameGateway, JwtService, GameSettingsService, ProfileService, UsersService, FriendshipService, FriendRequestService, BlockService, PlayerService, AchievementService],
})
export class GameModule { }
