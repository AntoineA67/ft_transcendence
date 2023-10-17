import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/message/messages.service';
import { Block, Member, Message } from '@prisma/client';
import { MemberService } from 'src/member/member.service';
import { subscribe } from 'diagnostics_channel';

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

@WebSocketGateway({ cors: true, namespace: 'chats' })
export class RoomGateway
	implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly roomService: RoomService,
		private readonly messagesService: MessagesService,
		private readonly memberService: MemberService,
	) { }
	private logger: Logger = new Logger('RoomGateway');

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		const previousRooms = await this.GetAllRoomsByUserid(client);
		for (let i = 0; i < previousRooms.length; i += 1) {
			const roomName = "room_" + previousRooms[i].id.toString();
			client.join(roomName);
		}
	}

	async handleDisconnect(client: Socket) {

	}

	@SubscribeMessage('getAllRoomsByUserid')
	async GetAllRoomsByUserid(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.roomService.getAllRoomsByUserid(id));
	}

	@SubscribeMessage('getRoomData')
	async handleGetRoomData(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<{ messages: MessageWithUsername[], roomTitle: string, roomChannel: boolean, members: Member[], memberStatus: Member }> {
	  const userId: number = client.data.user.id;
	  const roomid = parseInt(roomId, 10);
	  const memberStatus = await this.memberService.getMemberDatabyRoomId(userId, roomid);
	  const members = await this.memberService.getMembersByRoomId(roomid);
	  if (!memberStatus || memberStatus.ban)
		return null;
	  const roomData = await this.roomService.getRoomData(roomid, userId);
	  return {
		...roomData,
		members,
		memberStatus,
	  };
	}
	

	@SubscribeMessage('createChannelRoom')
	async handleCreateChannelRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: {roomTitle: string, isPublic: boolean, password: string},
	): Promise<Number> {
		const userId: number = client.data.user.id;
		const createdRoom = await this.roomService.createChannelRoom(data.roomTitle, data.isPublic, data.password, userId);
		if (createdRoom) {
			const roomName = "room_" + createdRoom.id.toString();
			client.join(roomName);
			this.server.to(roomName).emit('newRoom', createdRoom);
			return (createdRoom.id);
		} else {
			return (0);
		}
	}

	@SubscribeMessage('joinRoom')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomdata: { roomname: string, roomid: string, password: string },
	): Promise<boolean> {
		const userId: number = client.data.user.id;
		const roomId = parseInt(roomdata.roomid, 10);
		if (Number.isNaN(roomId))
			return false;
		const room = await this.roomService.joinRoom(roomdata.roomname, roomId, roomdata.password, userId);
		const roomName = "room_" + roomId.toString();
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
		const userId: number = client.data.user.id;
		const createdRoom = await this.roomService.createPrivateRoom(userId, username);
		if (createdRoom) {
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
			return (createdRoom.id);
		} else {
			return (0);
		}
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: { content: string, roomId: string, userid: number, username: string }) {
		const roomid = parseInt(message.roomId, 10);
		this.logger.log('message', message);
		const user = await this.memberService.getMemberDatabyRoomId(message.userid, roomid);
		if (user.ban || (user.mute !== null && new Date(user.mute) > new Date()))
			return ;
		const createdMessage = await this.messagesService.createMessage(message.content, roomid, message.userid);
		const roomName = "room_" + roomid.toString();
		if (createdMessage) {
			const newMessage = {
				id: createdMessage.id,
				message: createdMessage.message,
				send_date: createdMessage.send_date,
				userId: createdMessage.userId,
				roomId: createdMessage.roomId,
				username: message.username,
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

	@SubscribeMessage('getBlockStatus')
	async handlegetBlockStatus(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<boolean> {
		const userId: number = client.data.user.id;
		const roomid = parseInt(roomId, 10);
		return await this.roomService.getBlockStatus(userId, roomid);
	}

	@SubscribeMessage('changeRoomTitle')
	async handlechangeRoomTitle(@ConnectedSocket() client: Socket, @MessageBody() content: {roomId: string, roomtitle: string} ): Promise<boolean> {
		const userId: number = client.data.user.id;
		const roomid = parseInt(content.roomId, 10);
		const bool = await this.roomService.changeRoomTitle(userId, roomid, content.roomtitle);
		if (bool) {
			const response = {
				roomid: roomid,
				roomtitle: content.roomtitle,
			}
			client.emit('newRoomTitle', response);
			return true;
		}
		return false;
	}

	@SubscribeMessage('UserLeaveChannel')
	async handleUserLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() content: {usertoKick: number, roomId: string} ): Promise<boolean> {
		const userid: number = client.data.user.id;
		const roomid = parseInt(content.roomId, 10);
		const bool = await this.roomService.userLeaveChannel(userid, roomid, content.usertoKick);
		if (bool) {
			const leavechan = {
				userid: content.usertoKick,
				roomId: roomid
			}
			client.emit('UserLeaveChannel', leavechan);
			return true;
		}
		return false;
	}

	@SubscribeMessage('muteMember')
	async handleMuteMember(@ConnectedSocket() client: Socket, @MessageBody() content: { memberId: number, roomId: string, duration: number }): Promise<boolean> {
	  const userId: number = client.data.user.id;
	  const roomId = parseInt(content.roomId, 10);
	this.logger.log(userId, roomId, content.memberId, content.duration);
	  const bool = await this.roomService.muteMember(userId, roomId, content.memberId, content.duration);
	this.logger.log(bool);
	  if (bool) {
		const muteInfo = {
		  userId: content.memberId,
		  roomId: roomId,
		  duration: content.duration,
		};

		client.emit('muteMember', muteInfo);
		return true;
	  }
	  return false;
	}

	@SubscribeMessage('banMember')
	async handleBanMember(@ConnectedSocket() client: Socket, @MessageBody() content: {memberId: number, roomId: string, action: boolean}): Promise<boolean> {
	  const userid: number = client.data.user.id;
	  const roomid = parseInt(content.roomId, 10);
	  
	  const bool = await this.roomService.banMember(userid, roomid, content.memberId, content.action);
		if (bool) {
			const leavechan = {
				userid: content.memberId,
				roomId: roomid
			}
			client.emit('banMember', leavechan);
			return true;
		}
		return false;
	}

	@SubscribeMessage('inviteUser')
	async handleinviteUser(@ConnectedSocket() client: Socket, @MessageBody() content: {username: string, roomId: string}): Promise<boolean> {
	  const userid: number = client.data.user.id;
	  const roomid = parseInt(content.roomId, 10);
	  
	  const bool = await this.roomService.inviteUser(userid, roomid, content.username);
		if (bool) {
			return true;
		}
		return false;
	}
}
