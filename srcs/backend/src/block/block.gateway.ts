import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockService } from './block.service';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/dto/UserDto';

@WebSocketGateway()
export class BlockGateway {
 
	constructor(
		private readonly blockService: BlockService,
		private readonly usersService: UsersService
	) {};

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('findAllBlocks')
	async handleFindAllBlocks(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.blockService.getAllBlocked(id))
	}
	
	@SubscribeMessage('block')
	async handleBlock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number
	) {
		const id: number = client.data.user.id;
		const user: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const result = await this.blockService.createBlock(id, otherId); 
		// if fails, no emit
		if (!result) return (result);
		if (this.server.of('/').adapter.rooms.get(id.toString())) {
			this.server.to(id.toString()).emit('block', otherUser);
		}
		if (this.server.of('/').adapter.rooms.get(otherId.toString())) {
			this.server.to(otherId.toString()).emit('blocked', user);
		}
		return (result);
	}
	
	@SubscribeMessage('unblock')
	async handleUnblock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number
	) {
		const id: number = client.data.user.id;
		const user: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const result = await this.blockService.unBlock(id, otherId);
		// if fails, no emit
		if (!result) return (result);
		if (this.server.of('/').adapter.rooms.get(id.toString())) {
			this.server.to(id.toString()).emit('unblock', otherUser);
		}
		if (this.server.of('/').adapter.rooms.get(id.toString())) {
			this.server.to(otherId.toString()).emit('unblocked', user);
		}
		return (result);
	}
		
	// @SubscribeMessage('')
	// async handle(
	// 	@ConnectedSocket() client: Socket, 
	// 	@MessageBody() otherId: number) {
	// 	const id: number = client.data.user.id;
	// 	return (await this.blockService.isBlocked(id, otherId));
	// }
	
}
