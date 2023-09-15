import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { UsersService } from './users.service'; 

@WebSocketGateway({ cors: true, namespace: 'friends' })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private readonly usersService: UsersService) { }

	@WebSocketServer()
	server: Server;

	// on connection: add to a room, set online status
	handleConnection(client: Socket) {
		
	}

	handleDisconnect(client: Socket) {

	}
	
}