import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly usersService: UsersService 
		// private readonly friendService: FriendshipService, 
		// private readonly blockService: BlockService
	) { }

	private logger: Logger = new Logger('UsersGateway');

	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'ONLINE' });
		//emit to everyone
		client.broadcast.emit('online', id);
		
	}
	
	async handleDisconnect(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'OFFLINE' });
		// emit to everyone
		client.broadcast.emit('offline', id);
	}

	@SubscribeMessage('MyProfile')
	async handleMyProfile(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.usersService.getUserProfileById(id));
	}

	@SubscribeMessage('UpdateProfile')
	async handleUpdateProfile(@ConnectedSocket() client: Socket, @MessageBody() data: UpdateUserDto) {
		const id: number = client.data.user.id;
		this.logger.log(data);
		return (await this.usersService.updateUser(id, data))
	}

	@SubscribeMessage('newAvatar')
	async handleNewAvatar(@ConnectedSocket() client: Socket, @MessageBody() file: Buffer) {
		const id: number = client.data.user.id;
		// this.logger.log(file);
		return (await this.usersService.updateUser(id, {avatar: file}));
	}

	// @SubscribeMessage('Profile')
	// async handleProfile(@ConnectedSocket() client: Socket, @MessageBody() otherNick: string) {
	// 	const id: number = client.data.user.id;
	// 	let otherprofile = await this.usersService.getUserProfileByNick(otherNick);
	// 	const friend = await this.friendService.isFriend(id, otherNick);
	// 	const block = await this.blockService.isBlocked
	// }

}
