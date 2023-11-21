import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/message/messages.service';
import { Member } from '@prisma/client';
import { MemberService } from 'src/member/member.service';
import { MessageWithUsername, ProfileTest, Pvrooms, checkPassword, checkUserRoomName } from './roomDto';

@WebSocketGateway({ cors: true, namespace: 'chats' })
export class RoomGateway
	implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly roomService: RoomService,
		private readonly messagesService: MessagesService,
		private readonly memberService: MemberService,
	) { }
	private logger: Logger = new Logger('RoomGateway');

	private clients: Record<string, Socket> = {};

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		const previousRooms = await this.GetAllRoomsByUserid(client);

		for (let i = 0; i < previousRooms.length; i += 1) {
			const roomName = "room_" + previousRooms[i].id.toString();
			client.join(roomName);
		}

		this.clients[client.data.user.id.toString()] = client;
	}

	async handleDisconnect(client: Socket) {
		if (this.clients[client.data.user.id.toString()]) {
			delete this.clients[client.data.user.id.toString()];
		}
	}


	@SubscribeMessage('getAllRoomsByUserid')
	async GetAllRoomsByUserid(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.roomService.getAllRoomsByUserid(id));
	}

	@SubscribeMessage('getRoomData')
	async handleGetRoomData(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<{ messages: MessageWithUsername[], roomTitle: string, roomChannel: boolean, members: Member[], memberStatus: Member, private: boolean, password: boolean }> {
		const userId: number = client.data.user.id;
		if (!roomId.trim() || !/^[0-9]+$/.test(roomId) || typeof roomId !== 'string') {
			return {
				messages: [],
				roomTitle: '',
				roomChannel: false,
				members: [],
				memberStatus: null,
				private: false,
				password: false,
			};
		}
		const roomid = parseInt(roomId, 10);
		const memberStatus = await this.memberService.getMemberDatabyRoomId(userId, roomid);
		const members = await this.memberService.getMembersByRoomId(roomid);
		if (!memberStatus || memberStatus.ban)
			return {
				messages: [],
				roomTitle: '',
				roomChannel: false,
				members: [],
				memberStatus,
				private: false,
				password: false,
			};
		const roomData = await this.roomService.getRoomData(roomid, userId);
		return {
			...roomData,
			members,
			memberStatus,
			private: roomData.private,
			password: roomData.password,
		};
	}

	@SubscribeMessage('createChannelRoom')
	async handleCreateChannelRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			if (!data || typeof data.roomTitle !== 'string' || !checkUserRoomName(data.roomTitle)) {
				throw new Error('Room Title must be between 4 and 16 characters, alphanumeric only, and "-"');
			}

			if (typeof data.isPublic !== 'boolean') {
				throw new Error('Room must be either Public or Private');
			}

			if (data.password) {
				if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 20 || !checkPassword(data.password)) {
					throw new Error('Password must be between 8 and 20 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
				}
			}

			const userId: number = client.data.user.id;
			const createdRoom = await this.roomService.createChannelRoom(data.roomTitle, data.isPublic, data.password, userId);

			if (createdRoom) {
				const roomName = 'room_' + createdRoom.id.toString();
				client.join(roomName);
				client.emit('newRoom', createdRoom);
				return { success: true, roomId: createdRoom.id };
			} else {
				throw new Error('Failed to create room');
			}
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	@SubscribeMessage('joinRoom')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomdata: { roomTitle: string, roomid: string, password: string },
	): Promise<boolean> {
		const userId: number = client.data.user.id;
		const roomId = parseInt(roomdata.roomid, 10);

		if (Number.isNaN(roomId) ||
			!roomdata.roomTitle.trim() || !roomdata.roomid.trim() ||
			!/^[0-9]+$/.test(roomdata.roomid) || typeof roomdata.roomid !== 'string' ||
			typeof roomdata.roomTitle !== 'string') {
			return false;
		}

		if (!checkUserRoomName(roomdata.roomTitle)) {
			return false;
		}

		if (roomdata.password && !checkPassword(roomdata.password)) {
			return false;
		}

		const room = await this.roomService.joinRoom(roomdata.roomTitle, roomId, roomdata.password, userId);
		const roomName = 'room_' + roomId.toString();

		if (room) {
			client.join(roomName);
			client.emit('newRoom', room);
			return true;
		} else {
			return false;
		}
	}

	@SubscribeMessage('createPrivateRoom')
	async handleCreatePrivateRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() username: string,
	): Promise<Number> {
			if (!checkUserRoomName(username)) {
				console.error('Username must be between 4 and 16 characters, alphanumeric only, and "-"');
				return -1;
			}

			const userId: number = client.data.user.id;
			const createdRoom = await this.roomService.createPrivateRoom(userId, username);

			if (createdRoom && createdRoom.id) {
				const pvroomuser1 = {
					id: createdRoom.id,
					isChannel: false,
					title: username,
					private: true,
					password: '',
					messages: [],
				};
				const roomName = "room_" + createdRoom.id.toString();
				client.join(roomName);
				client.emit('newRoom', pvroomuser1);

				const user1 = await this.roomService.getMemberDatabyId(userId);
				const user2 = await this.roomService.getMemberDatabyUsername(username);

				if (user2) {
					const socketUser2 = this.clients[user2.id.toString()];
					if (socketUser2) {
						const pvroomuser2 = {
							id: createdRoom.id,
							isChannel: false,
							title: user1.username,
							private: true,
							password: '',
							messages: [],
						};
						const roomNameUser2 = "room_" + createdRoom.id.toString();
						socketUser2.join(roomNameUser2);
						socketUser2.emit('newRoom', pvroomuser2);
					}
				}

				return createdRoom.id;
			} else {
				return createdRoom;
			}
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: { content: string, roomId: string }) {
		const roomid = parseInt(message.roomId, 10);
		const userid = client.data.user.id;
		if (Number.isNaN(roomid) || !message.content.trim() || !message.roomId.trim() || !/^[0-9]+$/.test(message.roomId) || typeof message.roomId !== 'string' || typeof message.content !== 'string' || message.content.length > 10000) {
			return false;
		}
		const user = await this.roomService.getUserbyId(userid);
		const member = await this.memberService.getMemberDatabyRoomId(user.id, roomid);
		const room = await this.roomService.getRoomDataById(roomid);
		if (!room.isChannel) {
			const blockedinPrivRoom = await this.roomService.PrivRoomisBlocked(user.id, roomid);
			if (blockedinPrivRoom)
				return false;
		}
		if (member.ban || (member.mute !== null && new Date(member.mute) > new Date()))
			return false;
		const createdMessage = await this.messagesService.createMessage(message.content, roomid, user.id);
		const roomName = "room_" + roomid.toString();
		if (createdMessage) {
			const newMessage = {
				id: createdMessage.id,
				message: createdMessage.message,
				send_date: createdMessage.send_date,
				userId: createdMessage.userId,
				roomId: createdMessage.roomId,
				username: user.username,
			};
			this.server.to(roomName).emit('messageSent', newMessage);
			return true;
		} else
			return false;
	}

	@SubscribeMessage('getProfileForUser')
	async handlegetProfileForUser(@ConnectedSocket() client: Socket): Promise<ProfileTest | null> {
		const userId: number = client.data.user.id;
		return await this.roomService.getProfileForUser(userId);
	}

	@SubscribeMessage('getallPrivateRooms')
	async handleallPrivateRooms(@ConnectedSocket() client: Socket): Promise<Pvrooms[] | null> {
		const userId: number = client.data.user.id;
		return await this.roomService.getAllPrivateRooms(userId);
	}

	@SubscribeMessage('getPrivateRoom')
	async handlePrivateRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<Pvrooms | null> {
		const userId: number = client.data.user.id;
		const roomid = parseInt(roomId, 10);
		return await this.roomService.getPrivateRoomById(userId, roomid);
	}

	@SubscribeMessage('changeRoomTitle')
	async handlechangeRoomTitle(@ConnectedSocket() client: Socket, @MessageBody() content: { roomId: string, roomtitle: string }): Promise<boolean> {
		const userId: number = client.data.user.id;
		if (!content.roomtitle.trim() || !content.roomId.trim() || !/^[0-9]+$/.test(content.roomId) || typeof content.roomId !== 'string' || typeof content.roomtitle !== 'string') {
			return false;
		}
		const roomid = parseInt(content.roomId, 10);
		if (!checkUserRoomName(content.roomtitle)) {
			return false;
		}
		const bool = await this.roomService.changeRoomTitle(userId, roomid, content.roomtitle);
		if (bool) {
			const response = {
				roomid: roomid,
				roomtitle: content.roomtitle,
			};

			const roomName = "room_" + roomid.toString();
			this.server.to(roomName).emit('newRoomTitle', response);

			return true;
		}
		return false;
	}

	@SubscribeMessage('UserLeaveChannel')
	async handleUserLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() content: { usertoKick: number, roomId: string }): Promise<any> {
		const userid: number = client.data.user.id;
		if (!content.usertoKick.toString().trim() || !content.roomId.trim() || !/^[0-9]+$/.test(content.roomId) || typeof content.roomId !== 'string' || typeof content.usertoKick !== 'number') {
			return false;
		}
		const roomid = parseInt(content.roomId, 10);
		const bool = await this.roomService.userLeaveChannel(userid, roomid, content.usertoKick);

		if (bool) {
			const leavechan = {
				userid: content.usertoKick,
				roomId: roomid
			}
			const SockettoKick = this.clients[content.usertoKick.toString()];
			const roomName = "room_" + roomid.toString();
			this.server.to(roomName).emit('UserLeaveChannel', leavechan);
			if (SockettoKick)
				SockettoKick.leave("room_" + roomid.toString());
			const memtrue = {
				userid: content.usertoKick,
				roomId: roomid,
			}
			return memtrue;
		}
		const memfalse = {
			userid: 0,
			roomId: 0,
		}
		return memfalse;
	}

	@SubscribeMessage('muteMember')
	async handleMuteMember(@ConnectedSocket() client: Socket, @MessageBody() content: { memberId: number, roomId: string, duration: number }): Promise<boolean> {
		const userId: number = client.data.user.id;
		if (!content.memberId.toString().trim() || !content.roomId.trim() || !/^[0-9]+$/.test(content.roomId) || typeof content.roomId !== 'string' || typeof content.memberId !== 'number' || typeof content.duration !== 'number' || content.duration < 0) {
			return false;
		}
		const roomId = parseInt(content.roomId, 10);
		const bool = await this.roomService.muteMember(userId, roomId, content.memberId, content.duration);
		if (bool) {
			const usertomute = await this.roomService.getMemberDatabyId(content.memberId);
			const roomName = "room_" + roomId.toString();
			const member = await this.memberService.getMemberById(content.memberId, roomId);
			const SockettoMute = this.clients[usertomute.id.toString()];
			const membertosend = {
				...member,
				username: usertomute.username,
			};
			this.server.to(roomName).emit('newmemberListStatus', membertosend);
			const profileupdated = await this.roomService.getProfileForUser(content.memberId);
			if (SockettoMute){
				SockettoMute.emit('newmemberStatus', membertosend);
				SockettoMute.emit('newProfile', profileupdated);
			}
			return true;
		}
		return false;
	}

	@SubscribeMessage('banMember')
	async handleBanMember(@ConnectedSocket() client: Socket, @MessageBody() content: { memberId: number, roomId: string, action: boolean }): Promise<boolean> {
		const userid: number = client.data.user.id;
		if (!content.memberId.toString().trim() || !content.roomId.trim() || !/^[0-9]+$/.test(content.roomId) || typeof content.roomId !== 'string' || typeof content.memberId !== 'number' || typeof content.action !== 'boolean') {
			return false;
		}
		const roomid = parseInt(content.roomId, 10);

		const bool = await this.roomService.banMember(userid, roomid, content.memberId, content.action);
		if (bool) {
			const usertoban = await this.roomService.getMemberDatabyId(content.memberId);
			const roomName = "room_" + roomid.toString();
			const member = await this.memberService.getMemberById(content.memberId, roomid);
			const SocketToBan = this.clients[usertoban.id.toString()];
			const membertosend = {
				...member,
				username: usertoban.username,
			};
			this.server.to(roomName).emit('newmemberListStatus', membertosend);
			const profileupdated = await this.roomService.getProfileForUser(content.memberId);
			if (SocketToBan) {
				SocketToBan.emit('newmemberStatus', membertosend);
				SocketToBan.emit('newProfile', profileupdated);
				if (!content.action)
					SocketToBan.leave("room_" + roomid.toString());
				else
					SocketToBan.join("room_" + roomid.toString());
			}
			return true;
		}
		return false;
	}

	@SubscribeMessage('blockUser')
	async handleBlockUser(@ConnectedSocket() client: Socket, @MessageBody() content: { memberId: number, action: boolean }): Promise<boolean> {
		const userid: number = client.data.user.id;
		if (!content.memberId.toString().trim() || typeof content.memberId !== 'number' || typeof content.action !== 'boolean') {
			return false;
		}

		const bool = await this.roomService.blockUser(userid, content.memberId, content.action);
		const usertoblock = await this.roomService.getMemberDatabyId(content.memberId);
		const SocketToBlock = this.clients[usertoblock.id.toString()];
		const profileupdated = await this.roomService.getProfileForUser(content.memberId);
		if (bool) {
			if (SocketToBlock) {
				SocketToBlock.emit('newProfile', profileupdated);
			}
			return true;
		}
		return false;
	}


	@SubscribeMessage('inviteUser')
	async handleinviteUser(@ConnectedSocket() client: Socket, @MessageBody() content: { username: string, roomId: string }): Promise<Member | number> {
		const userid: number = client.data.user.id;
		if (!content.username.trim() || !content.roomId.trim() || !/^[0-9]+$/.test(content.roomId) || typeof content.roomId !== 'string' || typeof content.username !== 'string') {
			return -1;
		}
		const roomid = parseInt(content.roomId, 10);

		const nbid = await this.roomService.inviteUser(userid, roomid, content.username);
		const usertoadd = await this.roomService.getMemberDatabyUsername(content.username);


		if (nbid > 0) {
			const roomName = "room_" + roomid.toString();
			const room = await this.roomService.getRoomDataById(roomid);
			const SocketInvite = this.clients[usertoadd.id.toString()];
			if (SocketInvite) {
				SocketInvite.join(roomName);
				SocketInvite.emit('newRoom', room);
			}
			const member = await this.memberService.getMemberById(usertoadd.id, roomid);
			const membertosend = {
				...member,
				username: usertoadd.username,
			};
			this.server.to(roomName).emit('newMember', membertosend);
			return membertosend.id;
		}
		return nbid;
	}

	@SubscribeMessage('changeRole')
	async handlechangeRole(@ConnectedSocket() client: Socket, @MessageBody() content: { memberId: number, roomid: string, owner: boolean, admin: boolean }): Promise<boolean> {
		const userid: number = client.data.user.id;
		if (!content.memberId.toString().trim() || !content.roomid.trim() || !/^[0-9]+$/.test(content.roomid) || typeof content.roomid !== 'string' || typeof content.memberId !== 'number' || typeof content.owner !== 'boolean' || typeof content.admin !== 'boolean') {
			return false;
		}
		const roomId = parseInt(content.roomid, 10);

		const bool = await this.roomService.changeRole(userid, roomId, content.memberId, content.owner, content.admin);

		if (bool) {
			const usertochangerole = await this.roomService.getMemberDatabyId(content.memberId);
			const roomName = "room_" + roomId.toString();
			const member = await this.memberService.getMemberById(content.memberId, roomId);
			const SockettoChange = this.clients[usertochangerole.id.toString()];
			const membertosend = {
				...member,
				username: usertochangerole.username,
			};
			this.server.to(roomName).emit('newmemberListStatus', membertosend);
			if (SockettoChange)
				SockettoChange.emit('newmemberStatus', membertosend);
			return true;
		}
		return false;
	}

	@SubscribeMessage('changePassword')
	async handlechangePassword(
		@ConnectedSocket() client: Socket,
		@MessageBody() content: { roomId: string, password: string, delPass: boolean }
	): Promise<boolean> {
		const userid: number = client.data.user.id;
		if (!content.roomId.trim()  || typeof content.roomId !== 'string' || typeof content.delPass !== 'boolean') {
			return false;
		}
		if (!content.delPass && (typeof content.password !== 'string' || !checkPassword(content.password))) {
			return false;
		}
		const roomId = parseInt(content.roomId, 10);

		const bool = await this.roomService.changePassword(userid, roomId, content.password);

		if (bool) {
			return true;
		}
		return false;
	}


	@SubscribeMessage('deleteChannel')
	async handledeleteRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<boolean> {
		if (!roomId.trim() || !/^[0-9]+$/.test(roomId) || typeof roomId !== 'string') {
			return false;
		}
		const roomIdNumber = parseInt(roomId, 10);

		const bool = await this.roomService.deleteRoom(roomIdNumber);

		if (bool) {
			const roomName = "room_" + roomIdNumber.toString();
			this.server.to(roomName).emit('deleteRoom', roomIdNumber);
			return true;
		}
		return false;
	}

}
