import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';

const friendReq = Prisma.validator<Prisma.FriendRequestDefaultArgs>()({})
export type FriendReq = Prisma.FriendRequestGetPayload<typeof friendReq>

@Injectable()
export class FriendRequestService {
	
	constructor(
		private readonly usersService: UsersService,
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private prisma: PrismaService
	) {}

	// get nickname, avatar, online status, id
	// minus those that are blocked
	async findAllPendings(id: number) {
		const user = await this.usersService.getUserProfile(id);
		if (!user) return ([]);
		let pendings = await this.prisma.friendRequest.findMany({
			where: {
				possibleFriendId: {equals: id}
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						avatar: true,
						status: true,
					}
				}
			}
		})
		pendings = pendings.filter(async (x) => (
			await this.blockService.isBlocked(user.id, x.user.username) == false
		));
		return (pendings);
	}
	
	async sendFriendReq(id: number, nick: string): Promise<Boolean> {
		const me = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!me || !friend) return (false);
		// check if the user had blocked you
		const blocked = await this.blockService.isBlocked(friend.id, me.username);
		if (blocked) return (false);
		// check if they are already friends
		const isFriend = await this.friendshipService.isFriend(id, friend.username);
		if (isFriend) return (true);
		//check if there are pending requests
		const pendings = await this.getPendingReq(id, friend.username);
		if (pendings.length != 0) return (true);
		this.prisma.friendRequest.create({
			data: {
				userId: id,
				possibleFriendId: friend.id
			}
		})
		return (true);
	}

	async replyFriendReq(id: number, nick: string, accept: boolean): Promise<Boolean> {
		const me = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		const status = accept ? ReqState.ACCEPT : ReqState.DECLINE;
		if (!me || !friend) return (false);
		try {
			await this.prisma.friendRequest.updateMany({
				where: {
					AND: [
						{ userId: { equals: id } },
						{ possibleFriendId: { equals: friend.id } },
						{ status: { equals: 'PENDING' } }
					],
				},
				data: {
					status: status
				}
			})
		} catch (err: any) {console.log('err: replyFriendReq')};
		if (status == ReqState.ACCEPT) {
			await this.friendshipService.makeFriend(id, nick);
		}
	}

	async getPendingReq(id: number, nick: string) {
		const user = await this.usersService.getUserProfile(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!user || !friend) return ([]);
		const pendings = await this.prisma.friendRequest.findMany({
			where: {
				AND: [
					{ userId: { equals: id } },
					{ possibleFriendId: { equals: friend.id } },
					{ status: { equals: 'PENDING' } }
				],
			},
			include: {
				user: {select: {username: true}},
				possibleFriend: {select: {username: true}}
			}
		})
		return (pendings);
	}

}
