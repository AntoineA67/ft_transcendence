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
import { PlayerService } from 'src/player/player.service';
import { AchievementService } from 'src/achievement/achievement.service';

@WebSocketGateway({ cors: true })
export class UsersGateway
	implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(
		private readonly usersService: UsersService, 
		private readonly friendService: FriendshipService, 
		private readonly friendReqService: FriendRequestService, 
		private readonly blockService: BlockService, 
		private readonly playerService: PlayerService,
		private readonly achieveService: AchievementService,
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
		const gameHistory = await this.playerService.getHistory(id);
		const achieve = await this.achieveService.getAchieveById(id);
		let profile = await this.usersService.getUserProfileById(id);
		return ({ ... profile, gameHistory, achieve });
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
		// need some protection here
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
		const gameHistory = await this.playerService.getHistory(otherprofile.id);
		const achieve = await this.achieveService.getAchieveById(otherprofile.id);
		return ({ ... otherprofile, friend, block, blocked, sent, gameHistory, achieve });
	}

	@SubscribeMessage('Create2FA')
	async handleCreate2FA(@ConnectedSocket() client: Socket) {
		const data = this.usersService.generate2FASecret(client.data.user);
		this.usersService.updateUser(client.data.user.id, { otpHash: (await data).secret });
		return (await data);
	}

	@SubscribeMessage('Activate2FA')
	async handleActivate2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {
		console.log(data);
		const isValid = await this.usersService.verify2FA(client.data.user, data);

		if (isValid === true) {
			this.usersService.updateUser(client.data.user.id, { activated2FA: true });
			return (true);
		}
		return (false);
	}

	@SubscribeMessage('Disable2FA')
	async handleDisable2FA(@ConnectedSocket() client: Socket, @MessageBody() data) {
		console.log("Disable2FA --->", data);
		const isValid = await this.usersService.verify2FA(client.data.user, data);

		console.log("ISVALID", isValid);
		if (isValid === true) {
			this.usersService.updateUser(client.data.user.id, { otpHash: null, activated2FA: false });
			return (true);
		}
		return (false);
	}

} 
