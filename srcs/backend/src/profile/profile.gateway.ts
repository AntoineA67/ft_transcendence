import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { ProfileService } from './profile.service';

@WebSocketGateway({ cors: true })
export class ProfileGateway {

	constructor(
		private readonly profileService: ProfileService
	) { }

	private logger: Logger = new Logger('ProfileGateway');

	@SubscribeMessage('MyProfile')
	async handleMyProfile(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		try {
			return (await this.profileService.getUserProfileById(id, id))
		} catch (error) {
			return null;
		}
	}

	@SubscribeMessage('Profile')
	async handleProfile(@ConnectedSocket() client: Socket, @MessageBody() otherNick: string) {
		if (typeof otherNick != 'string' || otherNick.length == 0 || otherNick.length > 20 || !otherNick.match(/^[A-Za-z0-9-]+$/)) {
			return;
		}
		const id: number = client.data.user.id;
		try {
			return (await this.profileService.getUserProfileByNick(id, otherNick))
		} catch (error) {
			return null;
		}
	}
} 
