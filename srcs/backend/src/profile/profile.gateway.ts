import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';

import { ProfileDto } from 'src/dto/ProfileDto';
import { ProfileService } from './profile.service';

@WebSocketGateway({ cors: true })
export class ProfileGateway {
	
	constructor(
		private readonly profileService: ProfileService
	) { }

	private logger: Logger = new Logger('ProfileGateway');
	
	@SubscribeMessage('MyProfile')
	async handleMyProfile(@ConnectedSocket() client: Socket) {
		this.logger.log('MyProfile')
		const id: number = client.data.user.id;
		return (await this.profileService.getUserProfileById(id, id))
	}

	@SubscribeMessage('Profile')
	async handleProfile(@ConnectedSocket() client: Socket, @MessageBody() otherNick: string) {
		this.logger.log('Profile')
		const id: number = client.data.user.id;
		return (await this.profileService.getUserProfileByNick(id, otherNick))
	}
} 
