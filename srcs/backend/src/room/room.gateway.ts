import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/message/messages.service';
const joinedRooms = new Set<string>();

type MessageWithUsername = {
	id: number;
	message: string;
	send_date: Date;
	userId: number;
	roomId: number;
	username: string;
};

@WebSocketGateway({ cors: true })
export class RoomGateway
	implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly roomService: RoomService,
		private readonly messagesService: MessagesService,
	) { }
	private logger: Logger = new Logger('RoomGateway');

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		const previousRooms = Array.from(joinedRooms);
		for (const roomName of previousRooms) {
			client.join(roomName);
		}
		console.log(`Le client est connecté aux salles suivantes :`, client.rooms);
	}

	async handleDisconnect(client: Socket) {

	}
	

	@SubscribeMessage('getAllRoomsByUserid')
	async GetAllRoomsByUserid(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.roomService.getAllRoomsByUserid(id));
	}

	@SubscribeMessage('getRoomData')
	async handleGetRoomData(@ConnectedSocket() client: Socket, @MessageBody() roomId: string): Promise<{ messages: MessageWithUsername[], roomTitle: string }> {
		console.log('roomId', roomId);
		const userId: number = client.data.user.id;
		const roomid = parseInt(roomId, 10);
		const roomData = await this.roomService.getRoomData(roomid, userId);
		return roomData;
	}

	@SubscribeMessage('createChannelRoom')
	async handleCreateChannelRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomTitle: string,
	): Promise<Number> {
		const userId: number = client.data.user.id;
		const createdRoom = await this.roomService.createChannelRoom(roomTitle, userId);
		if (createdRoom) {
			const roomName = "room_" + createdRoom.id.toString();
			client.join(roomName);
			joinedRooms.add(roomName);
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
		const canJoin = await this.roomService.joinRoom(roomdata.roomname, roomId, roomdata.password, userId);
		const roomName = "room_" + roomId.toString();
		if (canJoin) {
			client.join(roomName);
			joinedRooms.add(roomName);
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
			const roomName = "room_" + createdRoom.id.toString();
			client.join(roomName);
			joinedRooms.add(roomName);
			this.server.to(roomName).emit('newRoom', createdRoom);
			return (createdRoom.id);
		} else {
			return (0);
		}
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() message: { content: string, roomId: string, userid: number, username: string }) {
		const roomid = parseInt(message.roomId, 10);
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
			console.log('newMessage', newMessage);
			this.server.to(roomName).emit('messageSent', newMessage);
			console.log(`Le client est connecté aux salles suivantes :`, client.rooms);
			return true;
		} else
			return false;
	}
}
