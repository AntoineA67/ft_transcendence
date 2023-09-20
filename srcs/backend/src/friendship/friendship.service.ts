import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { BlockService } from 'src/block/block.service';
import { UserDto } from 'src/dto/UserDto';

// const friendship = Prisma.validator<Prisma.FriendshipDefaultArgs>()({})
// export type Friendship = Prisma.FriendshipGetPayload<typeof friendship>

@Injectable()
export class FriendshipService {
	
	private logger = new Logger('FriendService');
	
	constructor(
		private usersService: UsersService,
		private blockService: BlockService,
		private prisma: PrismaService
	) { }

	//return all friends of a user, id, nick, avatar, status
	// minus those that block you or those that you block
	async findAllFriends(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserProfile(id);
		if (!user) return ([]);
		const friendships = await this.prisma.friendship.findMany({
			where: { friends: { some: { id } } },
			include: {
				friends: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true
					}
				}
			}
		})
		let myFriends: UserDto[] = friendships.map((x) => (
			x.friends[0].username != user.username ? x.friends[0] : x.friends[1]
		))
		// filter does not work with async
		const promises = await Promise.all(myFriends.map(async (x) => (
			await this.blockService.isBlocked(id, x.username) == false
			&& await this.blockService.isBlocked(x.id, user.username) == false
		)))
		myFriends = myFriends.filter((x, index) => (promises[index]))
		return (myFriends)
	}

	async makeFriend(id: number, nick: string): Promise<boolean> {
		const user = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!user || !friend) return (false);
		const areFriends = await this.isFriend(id, nick);
		if (areFriends) return (true);
		// this.logger.log('before create')
		try {
			await this.prisma.friendship.create({
				data: {
					friends: { connect: [{ id: id }, { id: friend.id }] }
				}
			})
		} catch (err: any) {
			console.log('err: makeFriend func');
			return (false)
		}
		// this.logger.log('adter create')
		return (true);
	}

	async unFriend(id: number, nick: string): Promise<boolean> {
		const user = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!user || !friend) return (false);
		let friendship = await this.prisma.friendship.findMany({
			where: { friends: { some: { id } } },
			include: {
				friends: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true
					}
				}
			}
		})
		friendship = friendship.filter((x) => (
			x.friends[0].username == nick || x.friends[1].username == nick
		))
		if (friendship.length == 0) return (true)
		for (let x of friendship) {
			try {
				await this.prisma.friendship.delete({ where: { id: x.id } })
			} catch (err: any) { console.log('err: unFriend func') };
		}
		return (true);
	}

	async isFriend(myId: number, nick: string): Promise<boolean> {
		const user = await this.usersService.getUserProfile(myId);
		if (!user) return (false);
		let myFriends = await this.findAllFriends(myId);
		myFriends = myFriends.filter((friend) => (friend.username == nick))
		return (myFriends.length != 0 ? true : false);
	}
}
