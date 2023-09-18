// friendship.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({ cors: true, namespace: 'friends' })
export class FriendshipGateway {
	
	constructor(private readonly friendshipService: FriendshipService) {}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('findAll')
	async handleFindAll(@MessageBody() data: any) {
		return (data)
		return await (this.friendshipService.findAllFriends('Sasha'));
		
	}
	
	@SubscribeMessage('hey')
	async handleHey(@MessageBody() data: any) {
		
		return (data);
	}




}
