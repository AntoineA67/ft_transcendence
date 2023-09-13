import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendDto } from './dto/FriendDto';

const friendship = Prisma.validator<Prisma.FriendshipDefaultArgs>()({})
export type Friendship = Prisma.FriendshipGetPayload<typeof friendship>

@Injectable()
export class FriendshipService {
	
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService
	) { }

	//return all friends of a user, id, nick, avatar, status
	async findAllFriends(nick: string): Promise<FriendDto[]> {
		const myId = await this.usersService.getIdByNick(nick);
		if (!myId) return ([]);
		const friendships = await this.prisma.friendship.findMany({
			where: { friends: { some: { id: myId } } },
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
			x.friends[0].username != nick ? x.friends[0] : x.friends[1]
		))
		return (myFriends)
	}

	async makeFriend(myNick: string, friendNick: string): Promise<Boolean> {
		const myId = await this.usersService.getIdByNick(myNick);
		const friendId = await this.usersService.getIdByNick(friendNick);
		const areFriends = await this.isFriend(myNick, friendNick);
		if (areFriends) return (true);
		try {
			await this.prisma.friendship.create({
				data: {
					friends: { connect: [{ id: myId }, { id: friendId }] }
				}
			})
		} catch (err: any) {
			console.log('err: makeFriend func');
			return (false)
		}
		return (true);
	}

	async unFriend(myNick: string, nick: string): Promise<Boolean> {
		const myId = await this.usersService.getIdByNick(nick);
		if (!myId) return (false);
		let friendship = await this.prisma.friendship.findMany({
			where: { friends: { some: { id: myId } } },
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

	async isFriend(myNick: string, nick: string): Promise<Boolean> {
		const id = await this.usersService.getIdByNick(nick);

		let myFriends = await this.findAllFriends(myNick);
		myFriends = myFriends.filter((friend) => (friend.username == nick))
		return (myFriends.length != 0 ? true : false);
	}
}
