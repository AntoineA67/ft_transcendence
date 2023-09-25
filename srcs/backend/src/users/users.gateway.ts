import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private readonly usersService: UsersService) { }
	private logger: Logger = new Logger('UsersGateway');

	// I think we need to make a restroction on the name of the channel, that it cannot be all number
	// all number is reserved for the id of the client
	async handleConnection(client: Socket) {
		const id: number = client.data.user.id;
		this.usersService.updateUser(id, { status: 'ONLINE' });
		client.join(id.toString());
		//emit to all freinds
	}

	async handleDisconnect(client: Socket) {
		const id: number = client.data.user.id;
		this.usersService.updateUser(id, { status: 'OFFLINE' });
		client.leave(id.toString());
		// emit to all friends
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

	@SubscribeMessage('Create2FA')
	async handleCreate2FA(@ConnectedSocket() client: Socket) {
		const data = this.usersService.generate2FASecret(client.data.user);
		this.usersService.updateUser(client.data.user.id, { otpHash: (await data).secret });
		return (await data);
	}

	@SubscribeMessage('Verify2FA')
	async handleVerify2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {
		console.log(data);
	}
} 
