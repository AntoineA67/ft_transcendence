import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendRequestService } from './friendrequest.service';
import { UserDto } from 'src/dto/UserDto';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true, namespace: 'friends' })
export class FriendRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger('FriendReqGateway')
	
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
		
		this.logger.log('new connection')
	}

	handleDisconnect(client: Socket) {
		this.logger.log('disconnection')
	// Gestion de la déconnexion du client
	}

	constructor(
		private readonly friendReqService: FriendRequestService,
		private readonly usersService: UsersService
	) { }

	@SubscribeMessage('findAllReqs')
	async handleFindAllReqs(@ConnectedSocket() client: Socket): Promise<UserDto[]> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;
		return (await this.friendReqService.findAllPendings(id));
	}
	
	// emit event 'friendReq' to recver
	@SubscribeMessage('sendReq')
	async handleSendReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody() nick: string): Promise<boolean> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;
		this.logger.log('id: ', id)
		const sender: UserDto = await this.usersService.getUserById(id);
		const recver: UserDto = await this.usersService.getUserByNick(nick);
		const result = await this.friendReqService.sendFriendReq(id, nick);
		// if fail, no emit
		if (!result) return (result);
		// if (this.server.of('/friends').adapter.rooms.get(recver.id.toString())) {
			this.server.to(recver.id.toString()).emit('recvfriendReq', sender);
		// }
		// if (this.server.of('/').adapter.rooms.get(sender.id.toString())) {
			this.server.to(sender.id.toString()).emit('sendfriendReq', recver);
		// }
		return (result);
	}

	// emit event 'friendReqAccept' to the original sender
	@SubscribeMessage('replyReq')
	async handleReplyReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody('other') otherId: number, 
		@MessageBody('result') result: boolean): Promise<boolean> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;
		const replier: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const ret = await this.friendReqService.replyFriendReq(id, otherId, result);
		// if fail, no emit
		if (!ret) return (ret);
		// if (this.server.of('/').adapter.rooms.get(otherId.toString())) {
			result && this.server.to(otherId.toString()).emit('friendReqAccept', replier)
		// }
		// if (this.server.of('/').adapter.rooms.get(id.toString())) {
			result && this.server.to(id.toString()).emit('friendReqAccept', otherUser)
		// }
		return (ret);
	}

	@SubscribeMessage('reqSent')
	async handleReqSent(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId): Promise<boolean> {
		const id: number = client.data.user.id;
		// const id: number = client.client['user'].id;

		const pendings = await this.friendReqService.getPendingReq(id, otherId);
		if (pendings.length == 0) return (false)
		return (true);
	}
}
