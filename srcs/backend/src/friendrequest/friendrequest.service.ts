import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';
import { UserDto } from 'src/dto/user.dto';


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
			await this.blockService.isBlocked(user.id, x.id) == false
		));
		return (pendings);
	}

	async sendFriendReq(id: number, nick: string): Promise<boolean> {
		const me = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserByNick(nick);
		if (!me || !friend) return (false);
		if (me.id == friend.id) return (false);
		// check if the user had blocked you
		const blocked = await this.blockService.isBlocked(friend.id, me.id);
		if (blocked) return (false);
		// check if you block the user
		const block = await this.blockService.isBlocked(me.id, friend.id);
		if (block) return (false)
		// check if they are already friends
		const isFriend = await this.friendshipService.isFriend(id, friend.id);
		if (isFriend) return (false);
		//check if there are pending requests
		const pendings = await this.getPendingReq(id, friend.id);
		if (pendings.length > 0) return (false);
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
		return (true);
	}

	async replyFriendReq(id: number, otherId: number, accept: boolean): Promise<boolean> {
		const me = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserById(otherId);
		const status = accept ? ReqState.ACCEPT : ReqState.DECLINE;
		if (!me || !friend) return (false);
		const pendings = await this.getPendingReq(otherId, id);
		if (pendings.length == 0) {
			return false;
		}
		// if error these two actions must rollback together
		if (status == ReqState.ACCEPT) {
			await this.friendshipService.makeFriend(id, otherId);
		}
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
						{ possibleFriendId: { equals: otherId } },
						{ status: { equals: 'PENDING' } }
					],
				},
				data: {
					status: status
				}
			})
		} catch (err: any) { };
		return (true);
	}

	async getPendingReq(id: number, otherId: number) {
		const user = await this.usersService.getUserById(id);
		const friend = await this.usersService.getUserById(otherId);
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
