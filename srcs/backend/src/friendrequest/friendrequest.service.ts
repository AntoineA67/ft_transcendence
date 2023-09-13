import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendReplyDto } from './dto/FriendReplyDto';
import { FriendReqDto } from './dto/FriendReqDto';
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
	async findAllPendings() {

	}
	
	async sendFriendReq(req: FriendReqDto): Promise<Boolean> {
		const sendId = await this.usersService.getIdByNick(req.sendNick);
		const recvId = await this.usersService.getIdByNick(req.recvNick);
		if (!sendId || !recvId) return (false);
		// check if the user had blocked you
		const blocked = await this.blockService.isBlocked(req.recvNick, req.sendNick);
		if (blocked) return (false);
		// check if they are already friends
		const isFriend = await this.friendshipService.isFriend(req.sendNick, req.recvNick);
		if (isFriend) return (true);
		//check if there are pending requests
		const pendings = await this.getPendingReq(req.sendNick, req.recvNick);
		if (pendings.length != 0) return (true);
		this.prisma.friendRequest.create({
			data: {
				userId: sendId,
				possibleFriendId: recvId
			}
		})
		return (true);
	}

	async replyFriendReq(reply: FriendReplyDto): Promise<Boolean> {
		const sendId = await this.usersService.getIdByNick(reply.sendNick);
		const recvId = await this.usersService.getIdByNick(reply.recvNick);
		const status = reply.reply == 'accept' ? ReqState.ACCEPT : ReqState.DECLINE;
		if (!sendId || !recvId) return (false);
		try {
			await this.prisma.friendRequest.updateMany({
				where: {
					AND: [
						{ userId: { equals: sendId } },
						{ possibleFriendId: { equals: recvId } },
						{ status: { equals: 'PENDING' } }
					],
				},
				data: {
					status: status
				}
			})
		} catch (err: any) {console.log('err: replyFriendReq')};
		if (status == ReqState.ACCEPT) {
			await this.friendshipService.makeFriend(reply.sendNick, reply.recvNick);
		}
	}

	async getPendingReq(myNick: string, nick: string) {
		const myId = await this.usersService.getIdByNick(myNick);
		const id = await this.usersService.getIdByNick(nick);
		if (!myId || !id) return ([]);
		const pendings = await this.prisma.friendRequest.findMany({
			where: {
				AND: [
					{ userId: { equals: myId } },
					{ possibleFriendId: { equals: id } },
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
