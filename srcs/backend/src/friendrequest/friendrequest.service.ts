import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReqState } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { FriendReplyDto } from './dto/FriendReplyDto';
import { FriendReqDto } from './dto/FriendReqDto';

@Injectable()
export class FriendRequestService {
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService
	) { }

	async replyFriendReq(reply: FriendReplyDto) {
		const sendId = await this.usersService.getIdByNick(reply.sendNick);
		const recvId = await this.usersService.getIdByNick(reply.recvNick);
		const status = reply.reply == 'accept' ? ReqState.ACCEPT : ReqState.DECLINE;
		if (!sendId) return ({ result: 'user not found' });
		if (!recvId) return ({ result: 'user not found' });
		const exist = await this.prisma.friendRequest.updateMany({
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
		if (status == ReqState.ACCEPT) {
			await this.prisma.friendship.create({
				data: {
					friends: { connect: [{ id: sendId }, { id: recvId }] }
				}
			})
		}
	}

	async createFriendReq(req: FriendReqDto) {
		const sendId = await this.usersService.getIdByNick(req.sendNick);
		const recvId = await this.usersService.getIdByNick(req.recvNick);
		if (!sendId) return ({ result: 'user not found' });
		if (!recvId) return ({ result: 'user not found' });
		// check block or not
		// check if they are already friends
		const exist = await this.prisma.friendRequest.findMany({
			where: {
				AND: [
					{ userId: { equals: sendId } },
					{ possibleFriendId: { equals: recvId } },
					{ status: { equals: 'PENDING' } }
				],
			},
		})
		if (exist.length == 0) {
			this.prisma.friendRequest.create({
				data: {
					userId: sendId,
					possibleFriendId: recvId
				}
			})
		}
		return ({ result: 'success' });
}
}
