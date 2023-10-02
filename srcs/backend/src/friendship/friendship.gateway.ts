// friendship.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { UserDto } from 'src/dto/UserDto';

@WebSocketGateway({ cors: true })
export class FriendshipGateway {
	
	constructor(private readonly friendshipService: FriendshipService) {}

	@SubscribeMessage('findAllFriends')
	async handlefindAllFriends(
		@ConnectedSocket() client: Socket): Promise<UserDto[]> {
		const id: number = client.data.user.id;
		return (await this.friendshipService.findAllFriends(id));
	}
	
	@SubscribeMessage('isFriend')
	async handleIsFriend(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number): Promise<boolean> {
		const id: number = client.data.user.id;
		return (await this.friendshipService.isFriend(id, otherId))
	}
	
	@SubscribeMessage('Unfriend')
	async handleUnfriend(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId: number): Promise<boolean> {
		const id: number = client.data.user.id;
		return (await this.friendshipService.unFriend(id, otherId))	
	}
}
