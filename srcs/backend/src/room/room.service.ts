import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Room, Prisma, Member, Message, Friendship, Block } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

type MessageWithUsername = {
	id: number;
	message: string;
	send_date: Date;
	userId: number;
	roomId: number;
	username: string;
};

type ProfileTest = {
	bio: string;
	id: number;
	status: string;
	username: string;
	membership: MemberWithLatestMessage[];
	pvrooms: Pvrooms[] | null;
};

type Pvrooms = {
	roomId: number,
	userId2: number,
	username2: string,
	block: boolean,
	blocked: boolean,
};

type MemberWithLatestMessage = {
	member: Member;
	latestMessage: Message | null;
};

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

	async createChannelRoom(roomtitle: string, userId: number): Promise<Room> {
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
			return null;

		const friendship = await this.findFriendship(userId, user.id);
		if (!friendship)
			return null;

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
		try {
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
		} catch (error) {
			console.error('Error in getPrivateRooms:', error);
			throw error;
		}
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


}
