import { Module } from '@nestjs/common';
import { AchievementModule } from 'src/achievement/achievement.module';
import { BlockModule } from 'src/block/block.module';
import { FriendRequestModule } from 'src/friendrequest/friendrequest.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { PlayerModule } from 'src/player/player.module';
import { UsersModule } from 'src/users/users.module';
import { ProfileGateway } from './profile.gateway';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
	imports: [
		UsersModule,
		FriendshipModule,
		FriendRequestModule,
		BlockModule,
		PlayerModule, 
		AchievementModule
	],
  	providers: [ProfileService, ProfileGateway],
	controllers: [ProfileController],
  	exports: [ProfileService],
})
export class ProfileModule { }