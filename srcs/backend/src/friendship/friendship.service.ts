import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { Friendship, Prisma, ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

const friendReq = Prisma.validator<Prisma.FriendRequestDefaultArgs>()({})
export type FriendReq = Prisma.FriendRequestGetPayload<typeof friendReq>

@Injectable()
export class FriendshipService {
	
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService
	) { }

	//return all friends of a user, id, nick, avatar, status
	async findAllFriends(nick: string) {
		const myId = await this.usersService.getIdByNick(nick);
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

	async isFriend(myNick: string, nick: string) {
		const id = await this.usersService.getIdByNick(nick);

		let myFriends = await this.findAllFriends(myNick);
		myFriends = myFriends.filter((friend) => (friend.username == nick))
		return (myFriends.length != 0 ? true : false);
	}

	async unFriend(myNick: string, nick: string) {
		const myId = await this.usersService.getIdByNick(nick);
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
		if (friendship.length == 0) return ({ result: 'not friends' });
		for (let x of friendship) {
			try {
				await this.prisma.friendship.delete({ where: { id: x.id } })
			} catch (err: any) { console.log('err: unFriend func') };
		}
		return ({ result: 'success' });
	}
}
