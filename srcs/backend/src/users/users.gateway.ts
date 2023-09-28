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
import { FriendRequestService } from 'src/friendrequest/friendrequest.service';
import { ProfileDto } from 'src/dto/ProfileDto';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly usersService: UsersService, 
		private readonly friendService: FriendshipService, 
		private readonly friendReqService: FriendRequestService, 
		private readonly blockService: BlockService
	) { }

	private logger: Logger = new Logger('UsersGateway');

	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'ONLINE' });
		// client join a room 
		client.join(id.toString())
		//emit to everyone
		client.broadcast.emit('online', id);	
	}
	
	async handleDisconnect(client: Socket) {
		const id: number = client.data.user.id;
		await this.usersService.updateUser(id, { status: 'OFFLINE' });
		// client leave a room 
		client.leave(id.toString())
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

	// this function cannot be done in the service, it will create circular dependency
	@SubscribeMessage('Profile')
	async handleProfile(@ConnectedSocket() client: Socket, @MessageBody() otherNick: string): Promise<ProfileDto> {
		const id: number = client.data.user.id;
		let otherprofile = await this.usersService.getUserProfileByNick(otherNick);
		if (id == otherprofile.id) return (otherprofile);
		const friend = await this.friendService.isFriend(id, otherprofile.id);
		const sent = (await this.friendReqService.getPendingReq(id, otherprofile.id)).length == 0 ? false : true;
		const block = await this.blockService.isBlocked(id, otherprofile.id);
		const blocked = await this.blockService.isBlocked(otherprofile.id, id);
		return ({ ... otherprofile, friend, block, blocked, sent });
	}

}
