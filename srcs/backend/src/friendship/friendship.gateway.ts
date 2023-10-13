// friendship.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { UserDto } from 'src/dto/user.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: 'friends' })
export class FriendshipGateway {
	
	constructor(private readonly friendshipService: FriendshipService) {}

	private logger = new Logger('FriendshipGateway')

	handleConnection(client: Socket) {
		this.logger.log('new connection')
		// Gestion de la connexion du client
		const id: number = client.data.user.id;
		// const id = client.client['user'].id;
		client.join(id.toString());
	}

	handleDisconnect(client: Socket) {
		this.logger.log('disconnection')
		// Gestion de la déconnexion du client
		const id: number = client.data.user.id;
		// const id = client.client['user'].id;
		client.leave(id.toString());
	}

	@SubscribeMessage('findAllFriends')
	async handlefindAllFriends(
		@ConnectedSocket() client: Socket): Promise<UserDto[]> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;

		return (await this.friendshipService.findAllFriends(id));
	}
	
	@SubscribeMessage('isFriend')
	async handleIsFriend(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number): Promise<boolean> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;

		return (await this.friendshipService.isFriend(id, otherId))
	}
	
	@SubscribeMessage('Unfriend')
	async handleUnfriend(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId: number): Promise<boolean> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;

		return (await this.friendshipService.unFriend(id, otherId))	
	}
}
