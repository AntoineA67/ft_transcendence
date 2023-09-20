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
	async handleMyProfile(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.roomService.getAllRoomsByUserid(id));
	}
}
