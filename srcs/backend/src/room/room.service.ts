import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Prisma, User, Message, Member } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { MessageWithUsername, ProfileTest, Pvrooms } from './roomDto';
import * as argon from 'argon2';

@Injectable()
export class RoomService {
	constructor(
		private prisma: PrismaService,
		private readonly usersService: UsersService,
	) { }
	private logger: Logger = new Logger('RoomGateway');

	async createRoom(data: Prisma.RoomCreateInput): Promise<Room> {
		return this.prisma.room.create({ data });
	}

	async getAllRooms(): Promise<Room[]> {
		return this.prisma.room.findMany();
	}

	async getUserbyId(id: number): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: id,
			},
		});

		if (!user) {
			return null;
		}

		return user;
	}

	async getMemberDatabyUsername(username: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: {
				username: username,
			},
		});

		if (!user) {
			return null;
		}

		return user;
	}

	async getBlockData(userId: number) {
		return await this.prisma.block.findMany({
			where: {
				userId: userId,
			},
		});
	}

	async getMemberDatabyId(id: number): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: id,
			},
		});

		if (!user) {
			return null;
		}

		return user;
	}

	async createMessage(messageContent: string, roomId: number, userid: number): Promise<Message> {
		return await this.prisma.message.create({
			data: {
				message: messageContent,
				send_date: new Date(),
				room: { connect: { id: roomId } },
				user: { connect: { id: userid } },
			},
		});
	}

	async getRoomDataById(roomid: number): Promise<Room | null> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomid,
			},
		});
		if (!room) {
			return null;
		}
		return room;
	}

	async getAllRoomsByUserid(id: number): Promise<Room[]> {
		const rooms = await this.prisma.room.findMany({
			where: {
				members: {
					some: {
						userId: id,
					},
				},
			},
		});
		const roomsWithLatestMessage = await Promise.all(
			rooms.map(async (room) => {
				const latestMessage = await this.prisma.message.findFirst({
					where: {
						roomId: room.id,
					},
					orderBy: {
						send_date: 'desc',
					},
				});
				return {
					...room,
					latestMessage,
				};
			})
		);
		roomsWithLatestMessage.sort((a, b) => {
			if (!a.latestMessage && !b.latestMessage) {
				return 0;
			} else if (!a.latestMessage) {
				return -1;
			} else if (!b.latestMessage) {
				return 1;
			} else {
				return b.latestMessage.send_date.getTime() - a.latestMessage.send_date.getTime();
			}
		});
		return roomsWithLatestMessage;
	}

	async createChannelRoom(roomtitle: string, isPublic: boolean, psw: string, userId: number): Promise<Room> {
		if (psw.trim() === '')
			psw = null;
		else
			psw = await argon.hash(psw);
		return this.prisma.room.create(
			{
				data: {
					title: roomtitle,
					isChannel: true,
					private: !isPublic,
					password: psw,
					members: {
						create: {
							admin: true,
							ban: false,
							owner: true,
							user: { connect: { id: userId } },
						},
					},
				},
			},
		);
	}

	async findUserByUsername(username: string) {
		return await this.prisma.user.findUnique({
			where: {
				username: username,
			},
		});
	}

	async findExistingPrivateRoom(userId: number, otherUserId: number) {
		return await this.prisma.room.findFirst({
			where: {
				isChannel: false,
				members: {
					some: {
						userId: userId,
					},
				},
				AND: [
					{
						members: {
							some: {
								userId: otherUserId,
							},
						},
					},
				],
			},
		});
	}

	async findFriendship(userId: number, otherUserId: number) {
		return await this.prisma.friendship.findFirst({
			where: {
				friends: {
					every: {
						id: {
							in: [userId, otherUserId],
						},
					},
				},
			},
		});
	}

	async isBlockedBy(userId: number, otherUserId: number): Promise<boolean> {
		const blockedBy = await this.prisma.block.findFirst({
			where: {
				AND: [
					{
						userId: otherUserId,
					},
					{
						blockedId: userId,
					},
				],
			},
		});
		if (!blockedBy)
			return false;
		return true;
	}

	async createPrivateRoom(userId: number, username: string): Promise<any> {
		const userprofile = await this.usersService.getUserById(userId);
		if (!userprofile)
			return -1;

		const user = await this.findUserByUsername(username);
		if (!user)
			return -2;

		if (user.id === userId)
			return -3;

		const existingRoom = await this.findExistingPrivateRoom(userId, user.id);
		if (existingRoom)
			return existingRoom;

		const isBlocked = await this.isBlockedBy(userId, user.id);
		if (isBlocked)
			return -4;

		const isBlocking = await this.isBlocking(userId, user.id);
		if (isBlocking)
			return -5;

		let randomTitle = Math.random().toString(36).substring(7);
		let roomname = "priv_room_" + randomTitle;

		return this.prisma.room.create({
			data: {
				title: roomname,
				isChannel: false,
				private: true,
				members: {
					create: [
						{
							admin: true,
							ban: false,
							owner: true,
							user: { connect: { id: userId } },
						},
						{
							admin: true,
							ban: false,
							owner: false,
							user: { connect: { id: user.id } },
						},
					],
				},
			},
		});
	}

	async getRoomData(roomid: number, userid: number): Promise<{ messages: MessageWithUsername[], roomTitle: string, roomChannel: boolean, private: boolean, password: boolean }> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomid,
				members: {
					some: {
						userId: userid,
					},
				},
			},
			include: {
				message: {
					include: {
						user: {
							select: {
								username: true,
							},
						},
					},
				},
			},
		});
		let roomTitle = room.title;
		if (!room) {
			return { messages: [], roomTitle: '', roomChannel: true, private: false, password: false };
		}

		const blocksbyuserId = await this.prisma.block.findMany({
			where: {
				userId: userid,
			},
		});

		const messagesWithUsername = room.message.map((message) => ({
			id: message.id,
			message: message.message,
			send_date: message.send_date,
			userId: message.userId,
			roomId: message.roomId,
			username: message.user ? message.user.username || 'user deleted' : 'user deleted',
		}));

		const messwithoutblock = messagesWithUsername.filter((message) => {
			if (message.userId === userid)
				return true;
			const block = blocksbyuserId.find((block) => block.blockedId === message.userId);
			if (block)
				return false;
			return true;
		});

		if (!room.isChannel) {
			const privchan = await this.getPrivateRoomById(userid, roomid);
			const blockedbyother = await this.isBlockedBy(userid, privchan.userId2);
			if (blockedbyother)
				return { messages: [], roomTitle: '', roomChannel: false, private: true, password: false };
			roomTitle = privchan.username2;
		}

		return { messages: messwithoutblock, roomTitle, roomChannel: room.isChannel, private: room.private, password: room.password ? true : false };
	}

	async joinRoom(roomname: string, roomid: number, password: string, userid: number): Promise<Room> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomid,
				title: roomname,
				isChannel: true,
				private: false,
			},
		});
		let passwordMatch = true;
		if (room && room.password && password.trim() !== '') {
			passwordMatch = await argon.verify(room.password, password);
		}
		if (!room || (room.password && !passwordMatch)) {
			return null;
		}
		const existingMember = await this.prisma.member.findFirst({
			where: {
				roomId: roomid,
				userId: userid,
			},
		});
		if (existingMember) {
			return null;
		}
		await this.prisma.member.create({
			data: {
				admin: false,
				ban: false,
				owner: false,
				user: { connect: { id: userid } },
				room: { connect: { id: roomid } },
			},
		});
		return room;
	}

	async changeRoomTitle(userId: number, roomid: number, newTitle: string): Promise<boolean> {
		const member = await this.prisma.member.findFirst({
			where: {
				roomId: roomid,
				userId: userId,
				OR: [
					{
						owner: true,
					},
					{
						admin: true
					}
				]
			},
		});

		if (!member) {
			return false;
		}
		const userRooms = await this.prisma.room.findMany({
			where: {
				members: {
					some: {
						userId: userId,
					}
				},
				title: newTitle,
			},
		});

		if (userRooms.length > 0) {
			return false;
		}

		const updatedRoom = await this.prisma.room.update({
			where: { id: roomid },
			data: { title: newTitle },
		});

		if (updatedRoom) {
			return true;
		}

		return false;
	}


	async updateRoom(id: number, data: Prisma.RoomUpdateInput): Promise<Room | null> {
		const existingRoom = await this.prisma.room.findUnique({ where: { id } });
		if (!existingRoom) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
		return this.prisma.room.update({
			where: { id },
			data,
		});
	}

	async deleteRoom(roomid: number, userid: number): Promise<Room | null> {
		const existingRoom = await this.prisma.room.findFirst({
			where: {
				id: roomid,
			},
		});

		const member = await this.prisma.member.findFirst({
			where: {
				roomId: roomid,
				userId: userid,
				owner: true
			},
		});

		if (!member) {
			return null;
		}

		if (!existingRoom) {
			throw new NotFoundException(`Room with ID ${roomid} not found`);
		}

		return this.prisma.room.delete({
			where: {
				id: roomid,
			},
		});
	}


	async getProfileForUser(userId: number): Promise<ProfileTest | null> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				membership: {
					include: {
						room: {
							include: {
								message: {
									orderBy: {
										send_date: 'desc',
									},
									take: 1,
								},
							},
						},
					},
				},
			},
		});

		if (!user) {
			return null;
		}

		const privaterooms = await this.getAllPrivateRooms(userId);
		const blocksbyuserId = await this.getBlockData(userId);

		const profile: ProfileTest = {
			bio: user.bio,
			id: user.id,
			status: user.status,
			username: user.username,
			membership: user.membership.map((member) => ({
				member: member,
				latestMessage: member.room.message.length > 0 ? member.room.message[0] : null,
			})),
			pvrooms: privaterooms,
			blocks: blocksbyuserId,
		};

		profile.membership.sort((a, b) => {
			if (a.member.ban && !b.member.ban) {
				return 1;
			} else if (!a.member.ban && b.member.ban) {
				return -1;
			} else if (!a.latestMessage && !b.latestMessage) {
				return 0;
			} else if (!a.latestMessage) {
				return -1;
			} else if (!b.latestMessage) {
				return 1;
			} else {
				return b.latestMessage.send_date.getTime() - a.latestMessage.send_date.getTime();
			}
		});

		return profile;
	}

	async getAllPrivateRooms(userId: number): Promise<Pvrooms[]> {
		const privateRooms = await this.prisma.room.findMany({
			where: {
				isChannel: false,
				members: {
					some: {
						userId: userId,
					},
				},
			},
			include: {
				members: {
					where: {
						NOT: [
							{ userId: userId }, // Exclude the user making the request
						],
					},
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				},
			},
		});

		const roomData = await Promise.all(privateRooms.map(async (room) => {
			if (room.members.length !== 1) {
				this.prisma.room.delete({
					where: {
						id: room.id,
					},
				});
				return null;
			}
			const user2 = room.members[0].user;
			return {
				roomId: room.id,
				userId2: user2.id,
				username2: user2.username,
				block: await this.isBlocking(userId, user2.id),
				blocked: await this.isBlocked(user2.id, userId),
			};
		}));

		return roomData;
	}

	async getPrivateRoomById(userId: number, roomId: number): Promise<Pvrooms | null> {
		try {
			const privateRoom = await this.prisma.room.findUnique({
				where: {
					id: roomId,
					members: {
						some: {
							userId: userId,
						},
					},
				},
				include: {
					members: {
						where: {
							NOT: [
								{ userId: userId }, // Exclude the user making the request
							],
						},
						include: {
							user: {
								select: {
									id: true,
									username: true,
								},
							},
						},
					},
				},
			});

			if (!privateRoom) {
				return null;
			}

			const member = privateRoom.members[0];

			const pvroom: Pvrooms = {
				roomId: privateRoom.id,
				userId2: member.userId,
				username2: privateRoom.members[0].user.username,
				block: await this.isBlocking(userId, member.userId),
				blocked: await this.isBlocked(member.userId, userId),
			};

			return pvroom;
		} catch (error) {
			console.error('Error in getPrivateRoomById:', error);
			throw error;
		}
	}

	async isBlocked(userId1: number, userId2: number): Promise<boolean> {
		const block = await this.prisma.block.findFirst({
			where: {
				userId: userId1,
				blockedId: userId2,
			},
		});
		if (!block)
			return false;
		return true;
	}

	async isBlocking(userId1: number, userId2: number): Promise<boolean> {
		const block = await this.prisma.block.findFirst({
			where: {
				userId: userId1,
				blockedId: userId2,
			},
		});
		if (!block)
			return false;
		return true;
	}

	async userLeaveChannel(userid: number, roomid: number, usertoKickid: number): Promise<boolean> {
		const user = await this.prisma.member.findFirst({
			where: {
				roomId: roomid,
				userId: userid,
				ban: false,
			},
		});

		const room = await this.prisma.room.findFirst({
			where: {
				id: roomid,
				isChannel: true,
			},
		});

		if (!room) {
			return false;
		}

		const userToKick = await this.prisma.member.findFirst({
			where: {
				roomId: roomid,
				userId: usertoKickid,
			},
		});

		if (!user || !userToKick || (userToKick.owner && !user.owner) ||
			(!user.admin && !user.owner && userid !== usertoKickid)) {
			return false;
		}

		await this.prisma.member.delete({
			where: {
				id: userToKick.id
			},
		});

		return true;
	}

	async blockUser(userId: number, blockedId: number, action: boolean): Promise<boolean> {
		const existingBlock = await this.prisma.block.findFirst({
			where: {
				userId: userId,
				blockedId: blockedId,
			},
		});
		Logger.log(existingBlock);
		Logger.log(action);
		if (action) {
			if (existingBlock) {
				await this.prisma.block.delete({
					where: {
						id: existingBlock.id,
					},
				});
			}
		} else {
			if (!existingBlock) {
				await this.prisma.block.create({
					data: {
						userId: userId,
						blockedId: blockedId,
					},
				});
			}
		}
		return true;
	}

	async getPrivateRoomBet2users(userId1: number, userId2: number): Promise<Room | null> {
		const room = await this.prisma.room.findFirst({
			where: {
				isChannel: false,
				members: {
					some: {
						userId: userId1,
					},
				},
				AND: [
					{
						members: {
							some: {
								userId: userId2,
							},
						},
					},
				],
			},
		});
		if (!room) {
			return null;
		}
		return room;
	}

	async banMember(userId: number, roomId: number, memberId: number, action: boolean): Promise<boolean> {
		const member = await this.prisma.member.findFirst({
			where: {
				roomId: roomId,
				userId: userId,
				ban: false,
			},
		});

		const memberToBan = await this.prisma.member.findFirst({
			where: {
				roomId: roomId,
				userId: memberId,
			},
		});

		if (!member || !memberToBan || memberToBan.owner ||
			(!member.admin && !member.owner && (memberToBan.admin || memberToBan.owner))) {
			return false;
		}

		await this.prisma.member.update({
			where: {
				id: memberToBan.id,
			},
			data: {
				ban: !action,
			},
		});

		return true;
	}

	async muteMember(userId: number, roomId: number, memberId: number, duration: number): Promise<boolean> {
		const member = await this.prisma.member.findFirst({
			where: {
				roomId: roomId,
				userId: userId,
				ban: false
			},
		});

		const memberToMute = await this.prisma.member.findFirst({
			where: {
				roomId: roomId,
				userId: memberId,
			},
		});
		if (!member || !memberToMute || memberToMute.ban
			|| !member.admin || (!member.owner && memberToMute.owner)) {
			return false;
		}

		await this.prisma.member.update({
			where: {
				id: memberToMute.id,
			},
			data: {
				mute: new Date(Date.now() + duration * 1000),
			},
		});

		return true;
	}

	async inviteUser(userId: number, roomId: number, username: string): Promise<number> {
		const user = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId,
				OR: [
					{
						owner: true,
					},
					{
						admin: true,
					},
				],
			},
		});

		if (!user) {
			return -1;
		}
		const userToInvite = await this.prisma.user.findFirst({
			where: {
				username,
			},
		});

		if (!userToInvite) {
			return -2;
		}

		const blocked = await this.prisma.block.findFirst({
			where: {
				OR: [
					{
						userId: userId,
						blockedId: userToInvite.id,
					},
					{
						userId: userToInvite.id,
						blockedId: userId,
					},
				],
			},
		});

		if (blocked) {
			return -3;
		}

		const isMember = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId: userToInvite.id,
			},
		});

		if (isMember) {
			return -4;
		}

		await this.prisma.member.create({
			data: {
				roomId,
				userId: userToInvite.id,
			},
		});

		return userToInvite.id;
	}

	async changeRole(userid: number, roomId: number, memberId: number, owner: boolean, admin: boolean): Promise<boolean> {
		const user = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId: userid,
			},
		});

		const membertochange = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId: memberId,
			},
		});

		if (!user || (!user.owner && !user.admin) || !membertochange || (membertochange.owner && !user.owner)) {
			return false;
		}

		if (user.owner && owner) {
			await this.prisma.member.update({
				where: {
					id: user.id,
				},
				data: {
					owner: false,
					admin: true,
				},
			});

			await this.prisma.member.update({
				where: {
					id: membertochange.id,
				},
				data: {
					owner: true,
					admin: true,
					ban: false,
					mute: null,
				},
			});

			return true;
		}

		await this.prisma.member.update({
			where: {
				id: membertochange.id
			},
			data: {
				admin,
			},
		});

		return true;
	}

	async changePassword(userid: number, roomId: number, password: string): Promise<boolean> {
		let user;
		try {
			user = await this.prisma.member.findFirst({
				where: {
					roomId,
					userId: userid,
					owner: true,
				},
			});
		} catch (error) {
			return false;
		}

		if (!user) {
			return false;
		}

		if (password.trim() === '') {
			password = null;
		}
		else {
			password = await argon.hash(password);
		}

		await this.prisma.room.update({
			where: {
				id: roomId,
			},
			data: {
				password,
			},
		});

		return true;
	}

	async PrivRoomisBlocked(userId: number, roomId: number): Promise<boolean> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomId,
			},
			include: {
				members: {
					where: {
						userId: { not: userId },
					},
				},
			},
		});

		if (!room) {
			return false;
		}

		const blocked = await this.prisma.block.findFirst({
			where: {
				OR: [
					{
						userId: userId,
						blockedId: room.members[0].userId,
					},
					{
						userId: room.members[0].userId,
						blockedId: userId,
					},
				],
			},
		});

		if (blocked) {
			return true;
		}

		return false;
	}

	async createMember(data: Prisma.MemberCreateInput): Promise<Member> {
		return this.prisma.member.create({ data });
	}

	async getMemberById(id: number, roomid: number): Promise<Member> {
		const member = await this.prisma.member.findFirst({
			where: {
				userId: id,
				roomId: roomid,
			},
		});
		if (!member) {
			throw new NotFoundException('Member not found');
		}
		return member;
	}

	async getMemberDatabyRoomId(userid: number, roomid: number): Promise<any | null> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomid,
			},
		});

		if (!room) {
			return null;
		}

		const member = await this.prisma.member.findFirst({
			where: {
				userId: userid,
				roomId: roomid,
			},
			include: {
				user: true,
			},
		});

		if (!member) {
			return null;
		}

		const memberstatus = {
			id: member.id,
			userId: member.userId,
			username: member.user.username,
			roomId: member.roomId,
			owner: member.owner,
			admin: member.admin,
			ban: member.ban,
			mute: member.mute,
		};

		return memberstatus;
	}


	async getMembersByRoomId(roomid: number): Promise<any[]> {
		const members = await this.prisma.member.findMany({
			where: {
				roomId: roomid,
			},
		});
		if (!members) {
			return null;
		}
		const membersList = [];
		for (const member of members) {
			const memberStatus = await this.getMemberDatabyRoomId(member.userId, roomid);
			if (memberStatus) {
				membersList.push(memberStatus);
			}
		}
		return membersList;
	}

	async updateMember(id: number, data: Prisma.MemberUpdateInput): Promise<Member | null> {
		const existingMember = await this.prisma.member.findUnique({ where: { id } });
		if (!existingMember) {
			throw new NotFoundException(`Member with ID ${id} not found`);
		}
		return this.prisma.member.update({
			where: { id },
			data,
		});
	}

	async isBanned(userId: number, roomId: number): Promise<boolean> {
		const member = await this.prisma.member.findFirst({
			where: {
				userId,
				roomId,
			},
		});
		if (!member) {
			return false;
		}
		return member.ban;
	}
}
