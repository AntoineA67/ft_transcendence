// friendship.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class FriendshipGateway {
	
	constructor(private readonly friendshipService: FriendshipService) {}

	@SubscribeMessage('findAllFriends')
	async handlefindAllFriends(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (this.friendshipService.findAllFriends(id));
	}
	
	

}
