import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendRequestService } from './friendrequest.service';
import { UserDto } from 'src/dto/UserDto';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true })
export class FriendRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger('FriendReqGateway')
	
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
	// Gestion de la connexion du client
	}

	handleDisconnect(client: Socket) {
	// Gestion de la déconnexion du client
	}

	constructor(
		private readonly friendReqService: FriendRequestService,
		private readonly usersService: UsersService
	) { }

	@SubscribeMessage('findAllReqs')
	async handleFindAllReqs(@ConnectedSocket() client: Socket): Promise<UserDto[]> {
		const id: number = client.data.user.id;
		return (await this.friendReqService.findAllPendings(id));
	}
	
	// emit event 'friendReq' to recver
	@SubscribeMessage('sendReq')
	async handleSendReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody() nick: string): Promise<boolean> {
		const id: number = client.data.user.id;
		const sender: UserDto = await this.usersService.getUserById(id);
		const recver: UserDto = await this.usersService.getUserByNick(nick);
		if (this.server.sockets.adapter.rooms[recver.id.toString()]) {
			//if room exist
			this.server.to(recver.id.toString()).emit('friendReq', sender);
		}
		return (await this.friendReqService.sendFriendReq(id, nick))
	}

	// emit event 'friendReqAccept' to the original sender
	@SubscribeMessage('replyReq')
	async handleReplyReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody('other') otherId: number, 
		@MessageBody('result') result: boolean): Promise<boolean> {
		const id: number = client.data.user.id;
		const newFriend: UserDto = await this.usersService.getUserById(id);
		if (this.server.sockets.adapter.rooms[otherId.toString()]) {
			//if room exist
			result && this.server.to(otherId.toString()).emit('friendReqAccept', newFriend)
		}
		return (await this.friendReqService.replyFriendReq(id, otherId, result))
	}

	@SubscribeMessage('reqSent')
	async handleReqSent(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId): Promise<boolean> {
		const id: number = client.data.user.id;
		const pendings = await this.friendReqService.getPendingReq(id, otherId);
		if (pendings.length == 0) return (false)
		return (true);
	}
}
