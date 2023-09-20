import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendDto } from './dto/FriendDto';
import { BlockService } from 'src/block/block.service';

const friendship = Prisma.validator<Prisma.FriendshipDefaultArgs>()({})
export type Friendship = Prisma.FriendshipGetPayload<typeof friendship>

@Injectable()
export class FriendshipService {
	
	constructor(
		private usersService: UsersService,
		private blockService: BlockService,
		private prisma: PrismaService
	) { }

	//return all friends of a user, id, nick, avatar, status
	// minus those that block you or those that you block
	async findAllFriends(id: number): Promise<FriendDto[]> {
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
		let myFriends = friendships.map((x) => (
			x.friends[0].username != user.username ? x.friends[0] : x.friends[1]
		))
		myFriends = myFriends.filter(async (x) => (
			await this.blockService.isBlocked(user.id, x.username) == false
			&& await this.blockService.isBlocked(x.id, user.username) == false
		))
		return (myFriends)
	}

	async makeFriend(id: number, nick: string): Promise<Boolean> {
		const user = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!user || !friend) return (false);
		const areFriends = await this.isFriend(id, nick);
		if (areFriends) return (true);
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
		return (true);
	}

	async unFriend(id: number, nick: string): Promise<Boolean> {
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

	async isFriend(myId: number, nick: string): Promise<Boolean> {
		const user = await this.usersService.getUserProfile(myId);
		if (!user) return (false);
		let myFriends = await this.findAllFriends(myId);
		myFriends = myFriends.filter((friend) => (friend.username == nick))
		return (myFriends.length != 0 ? true : false);
	}
}
