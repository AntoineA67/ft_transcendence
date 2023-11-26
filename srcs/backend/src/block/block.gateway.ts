import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockService } from './block.service';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/dto/user.dto';
import { Logger } from '@nestjs/common';
@WebSocketGateway({ cors: true, namespace: 'friends' })
export class BlockGateway {
 
	constructor(
		private readonly blockService: BlockService,
		private readonly usersService: UsersService
	) {};

	@WebSocketServer()
	server: Server;

	private logger = new Logger('BlockGateway')

	handleConnection(client: Socket) {

	}

	handleDisconnect(client: Socket) {

	}

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
		if (typeof otherId != 'number') {
			return ;
		}
		const id: number = client.data.user.id;
		const user: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const result = await this.blockService.createBlock(id, otherId); 
		if (!result) return (result);
		this.server.to(id.toString()).emit('block', otherUser);
		this.server.to(otherId.toString()).emit('blocked', user);
		return (result);
	}
	
	@SubscribeMessage('unblock')
	async handleUnblock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number
	) {
		if (typeof otherId != 'number') {
			return ;
		}
		const id: number = client.data.user.id;
		const user: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const result = await this.blockService.unBlock(id, otherId);
		
		if (!result) return (result);
		this.server.to(id.toString()).emit('unblock', otherUser);
		this.server.to(otherId.toString()).emit('unblocked', user);
		return (result);
	}
	
}
