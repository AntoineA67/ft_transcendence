import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendReplyDto } from './dto/FriendReplyDto';
import { FriendReqDto } from './dto/FriendReqDto';
import { FriendDto } from './dto/FriendDto';
import { Prisma, OnlineStatus, ReqState } from '@prisma/client'

const friendReq = Prisma.validator<Prisma.FriendRequestDefaultArgs>()({})
export type FriendReq = Prisma.FriendRequestGetPayload<typeof friendReq>


@Injectable()
export class FriendsService {
	constructor(
		private usersService: UsersService,
		private prisma: PrismaService
	) {}

	//return all friends of a user, id, nick, avatar, status
	async findAll(nick: string) {
		const myId = await this.usersService.getIdByNick(nick);
		const friendships = await this.prisma.friendship.findMany({
			where: { friends: { some: { id: myId } } },
			include: { friends: {select: {
				id: true, 
				username: true, 
				avatar: true, 
				status: true
			}}}
		})
		let myFriends = friendships.map((x) => (
			x.friends[0].username != nick ? x.friends[0] : x.friends[1]
		))
		return (myFriends)
	}

	
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
			data:{
				status: status
			}
		})
		if (status == ReqState.ACCEPT) {
			await this.prisma.friendship.create({
				data:{
					friends: { connect: [{id: sendId}, {id: recvId}] }
				}
			})
		}
	}
	
	async createFriendReq(req: FriendReqDto) {
		const sendId = await this.usersService.getIdByNick(req.sendNick);
		const recvId = await this.usersService.getIdByNick(req.recvNick);
		if (!sendId) return ({result: 'user not found'});
		if (!recvId) return ({result: 'user not found'});
		// check block or not
		// check if they are already friends
		const exist = await this.prisma.friendRequest.findMany({
			where: {
				AND: [
					{ userId: { equals: sendId } },
					{ possibleFriendId: { equals: recvId }},
					{ status: { equals: 'PENDING'} }
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
		return ({result: 'success'});
	}


	

}
