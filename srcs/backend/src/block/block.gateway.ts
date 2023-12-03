import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	ConnectedSocket,
	MessageBody,
	WsException
} from '@nestjs/websockets';
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
	) { };

	@WebSocketServer()
	server: Server;

	private logger = new Logger('BlockGateway')

	handleConnection(client: Socket) {
		// Gestion de la connexion du client
	}

	handleDisconnect(client: Socket) {
		// Gestion de la déconnexion du client
	}

	@SubscribeMessage('findAllBlocks')
	async handleFindAllBlocks(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		try {
			return (await this.blockService.getAllBlocked(id))
		} catch (error) {
			return [];
		}
	}

	@SubscribeMessage('block')
	async handleBlock(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId: number
	) {
		try {
			if (typeof otherId != 'number' || otherId <= 0 || otherId > 100000) {
				return;
			}
			const id: number = client.data.user.id;
			const user: UserDto = await this.usersService.getUserById(id);
			const otherUser: UserDto = await this.usersService.getUserById(otherId);
			if (!user || !otherUser) {
				return;
			}
			const result = await this.blockService.createBlock(id, otherId);
			// if fails, no emit
			if (!result) return (result);
			this.server.to(id.toString()).emit('block', otherUser);
			this.server.to(otherId.toString()).emit('blocked', user);
			return (result);
		} catch (e: any) {
			return;
		}
	}

	@SubscribeMessage('unblock')
	async handleUnblock(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId: number
	) {
		try {
			if (typeof otherId != 'number' || otherId <= 0 || otherId > 100000) {
				return;
			}
			const id: number = client.data.user.id;
			if (id === otherId) {
				return;
			}
			if (id <= 0 || id > 100000) {
				return;
			}
			const user: UserDto = await this.usersService.getUserById(id);
			const otherUser: UserDto = await this.usersService.getUserById(otherId);
			if (!user || !otherUser) {
				return;
			}
			const result = await this.blockService.unBlock(id, otherId);

			// if fails, no emit
			if (!result) return (result);
			this.server.to(id.toString()).emit('unblock', otherUser);
			this.server.to(otherId.toString()).emit('unblocked', user);
			return (result);
		} catch (e: any) {
			return;
		}
	}

}
