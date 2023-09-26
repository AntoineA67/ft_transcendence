import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Socket } from 'socket.io';
import { users } from 'src/prisma/seeds/users';
import { User } from 'src/users/users.service';
import { MessagesService } from '../message/messages.service';
import { Message } from '@prisma/client';

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
	constructor(private readonly roomService: RoomService) { }
	private logger: Logger = new Logger('RoomGateway');

	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		client.join(id.toString());
	}

	async handleDisconnect(client: Socket) {
		const id: number = client.data.user.id;
		client.leave(id.toString());
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
}
