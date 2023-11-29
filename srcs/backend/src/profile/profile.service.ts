import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { ProfileDto } from '../dto/profile.dto';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendRequestService } from 'src/friendrequest/friendrequest.service';
import { BlockService } from 'src/block/block.service';
import { PlayerService } from 'src/player/player.service';
import { AchievementService } from 'src/achievement/achievement.service';


@Injectable()
export class ProfileService {
	constructor(
		private readonly usersService: UsersService, 
		private readonly friendService: FriendshipService, 
		private readonly friendReqService: FriendRequestService, 
		private readonly blockService: BlockService, 
		private readonly playerService: PlayerService,
		private readonly achieveService: AchievementService,
	) { }

	// the freind, block, blocked should be given by other services
	async getUserProfileById(userId: number, otherId: number): Promise<ProfileDto | null> {
		
		try {
			let profile = await this.usersService.getHalfProfile(otherId);
			if (!profile) return (null);
			const gameHistory = await this.playerService.getHistory(otherId);
			const achieve = await this.achieveService.getAchieveById(otherId);
			if (userId == otherId) {
				return ({ ...profile, gameHistory, achieve })
			}
			const friend = await this.friendService.isFriend(userId, otherId);
			const sent = (await this.friendReqService.getPendingReq(userId, otherId)).length == 0 ? false : true;
			const block = await this.blockService.isBlocked(userId, otherId);
			const blocked = await this.blockService.isBlocked(otherId, userId);
			return ({
				...profile,
				friend, block, blocked, sent, gameHistory, achieve
			})
		} catch(e: any) {
			return null;
		}
	}

	async getUserProfileByNick(userId: number, otherNick: string): Promise<ProfileDto | null> {
		const otherId = await this.usersService.getIdByNick(otherNick);
		if (!otherId) return (null);
		return (await this.getUserProfileById(userId, otherId) );
	}


}
