import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, Prisma, User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { MessageWithUsername, ProfileTest, Pvrooms } from './roomDto';

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

	async getRoomDataById (roomid: number): Promise<Room | null> {
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

	// TODO : check how to change this (found on prisma.io), maybe there are too many operations to sort...
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
		const existingRoom = await this.prisma.room.findFirst({
			where: {
				title: roomtitle,
				isChannel: true,
			},
		});
		if (existingRoom)
			return null;
		return this.prisma.room.create(
			{
				data: {
					title: roomtitle,
					isChannel: true,
					private: !isPublic,
					password: (psw.trim() === '' ? null : psw),
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
				OR: [
					{
						AND: [
							{
								userId: otherUserId,
							},
							{
								blockedId: userId,
							},
						],
					},
					{
						AND: [
							{
								userId: userId,
							},
							{
								blockedId: otherUserId,
							},
						],
					}
				],
			},
		});
		if (!blockedBy)
			return false;
		return true;
	}

	async createPrivateRoom(userId: number, username: string) {
		const userprofile = await this.usersService.getUserById(userId);
		if (!userprofile)
			return null;

		const user = await this.findUserByUsername(username);
		if (!user)
			return null;

		const existingRoom = await this.findExistingPrivateRoom(userId, user.id);
		if (existingRoom)
			return existingRoom;

		const isBlocked = await this.isBlockedBy(userId, user.id);
		if (isBlocked)
			return null;

		let resTitle = userprofile.username + '/' + username;

		return this.prisma.room.create({
			data: {
				title: resTitle,
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

	async getRoomData(roomid: number, userid: number): Promise<{ messages: MessageWithUsername[], roomTitle: string, roomChannel: boolean }> {
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
			return { messages: [], roomTitle: '', roomChannel: true };
		}
		const messagesWithUsername = room.message.map((message) => ({
			id: message.id,
			message: message.message,
			send_date: message.send_date,
			userId: message.userId,
			roomId: message.roomId,
			username: message.user ? message.user.username || 'user deleted' : 'user deleted',
		}));

		if (!room.isChannel) {
			const privchan = await this.getPrivateRoomById(userid, roomid);
			roomTitle = privchan.username2;
		}

		return { messages: messagesWithUsername, roomTitle, roomChannel: room.isChannel };
	}

	async joinRoom(roomname: string, roomid: number, password: string, userid: number): Promise<Room> {
		const room = await this.prisma.room.findUnique({
			where: {
				id: roomid,
				title: roomname,
				isChannel: true,
			},
		});
		if (!room || (room.password && room.password !== password)) {
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
		this.logger.log(userId, roomid, newTitle)

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

	async deleteRoom(id: number): Promise<Room | null> {
		const existingRoom = await this.prisma.room.findUnique({ where: { id } });
		if (!existingRoom) {
			throw new NotFoundException(`Room with ID ${id} not found`);
		}
		return this.prisma.room.delete({ where: { id } });
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
		const blocksbyuserId = await this.prisma.block.findMany({
			where: {
				userId: userId,
			},
		});

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
			const userId2 = room.members[0].user.id;
			return {
				roomId: room.id,
				userId2,
				username2: room.members[0].user.username,
				block: await this.isBlocking(userId, userId2),
				blocked: await this.isBlocked(userId2, userId),
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

	async getBlockStatus(userId: number, roomId: number): Promise<boolean> {
		const privaterroms = await this.getAllPrivateRooms(userId);

		if (!privaterroms)
			return false;

		const blockedRoom = privaterroms.find((room) => room.roomId === roomId);

		return !!blockedRoom;
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

		const room = await this.prisma.room.findFirst({
			where: {
				id: roomId,
			},
		});

		if (!room.isChannel) {
			const blockstatus = await this.prisma.block.findFirst({
				where: {
					userId: userId,
					blockedId: memberId,
				},
			});
			if (blockstatus) {
				await this.prisma.block.delete({
					where: {
						id: blockstatus.id,
					},
				});
			}
			else {
				await this.prisma.block.create({
					data: {
						userId: userId,
						blockedId: memberId,
					},
				});
			}
			return true;
		}

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
		this.logger.log(member, memberToMute);
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

	async inviteUser(userId: number, roomId: number, username: string): Promise<boolean> {
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
			return false;
		}
		const userToInvite = await this.prisma.user.findFirst({
			where: {
				username,
			},
		});

		if (!userToInvite) {
			return false;
		}

		const isMember = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId: userToInvite.id,
			},
		});

		if (isMember) {
			return false;
		}

		await this.prisma.member.create({
			data: {
				roomId,
				userId: userToInvite.id,
			},
		});

		return true;
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

		if (!user || (!user.owner && !user.admin)) {
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
					admin: false,
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
		const user = await this.prisma.member.findFirst({
			where: {
				roomId,
				userId: userid,
				owner: true,
			},
		});

		if (!user) {
			return false;
		}

		if (password.trim() === '') {
			password = null;
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
}
