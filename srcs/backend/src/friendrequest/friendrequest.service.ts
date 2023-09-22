import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';
import { UserDto } from 'src/dto/UserDto';

// const friendReq = Prisma.validator<Prisma.FriendRequestDefaultArgs>()({})
// export type FriendReq = Prisma.FriendRequestGetPayload<typeof friendReq>

@Injectable()
export class FriendRequestService {

	private logger = new Logger('FriendReq');

	constructor(
		private readonly usersService: UsersService,
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private prisma: PrismaService
	) { }

	// get nickname, avatar, online status, id
	// minus those that are blocked
	async findAllPendings(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserById(id);
		if (!user) return ([]);
		let reqs = await this.prisma.friendRequest.findMany({
			where: {
				possibleFriendId: { equals: id },
				status: ReqState.PENDING
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
		const pendings = reqs.map((x) => (x.user)).filter(async (x) => (
			await this.blockService.isBlocked(user.id, x.username) == false
		));
		return (pendings);
	}

	async sendFriendReq(id: number, nick: string): Promise<boolean> {
		const me = await this.usersService.getUserById(id);
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
		this.logger.log('before prisma create')
		this.logger.log(me.username)
		this.logger.log(friend.username)
		await this.prisma.friendRequest.create({
			data: {
				user: {
					connect: { username: me.username }
				},
				possibleFriend: {
					connect: { username: friend.username }
				}
			}
		})
		this.logger.log('after prisma create')
		return (true);
	}

	async replyFriendReq(id: number, nick: string, accept: boolean): Promise<boolean> {
		const me = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserByNick(nick);
		const status = accept ? ReqState.ACCEPT : ReqState.DECLINE;
		if (!me || !friend) return (false);
		// if error these two actions must rollback together
		if (status == ReqState.ACCEPT) {
			await this.friendshipService.makeFriend(id, nick);
		}
		this.logger.log('adter MakeFriend');
		try {
			await this.prisma.friendRequest.updateMany({
				where: {
					AND: [
						{ userId: { equals: friend.id } },
						{ possibleFriendId: { equals: id } },
						{ status: { equals: 'PENDING' } }
					],
				},
				data: {
					status: status
				}
			})
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
		} catch (err: any) { console.log('err: replyFriendReq') };
		return (true);
	}

	async getPendingReq(id: number, nick: string) {
		const user = await this.usersService.getUserById(id);
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
				user: { select: { username: true } },
				possibleFriend: { select: { username: true } }
			}
		})
		return (pendings);
	}

}
