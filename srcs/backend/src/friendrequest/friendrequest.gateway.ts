import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendRequestService } from './friendrequest.service';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true, namespace: 'friends' })
export class FriendRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger('FriendReqGateway')
	
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
	}

	handleDisconnect(client: Socket) {
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

	@SubscribeMessage('sendReq')
	async handleSendReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody() nick: string
	): Promise<boolean> {
		if (typeof nick != 'string') {
			return false;
		}
		const id: number = client.data.user.id;
		const sender: UserDto = await this.usersService.getUserById(id);
		const recver: UserDto = await this.usersService.getUserByNick(nick);
		const result = await this.friendReqService.sendFriendReq(id, nick);

		if (!result) return (result);
		this.server.to(recver.id.toString()).emit('recvfriendReq', sender);
		this.server.to(sender.id.toString()).emit('sendfriendReq', recver);
		return (result);
	}

	@SubscribeMessage('replyReq')
	async handleReplyReq(
		@ConnectedSocket() client: Socket, 
		@MessageBody('other') otherId: number, 
		@MessageBody('result') result: boolean
	): Promise<boolean> {
		if (typeof otherId != 'number' || typeof result != 'boolean') {
			return false;
		}
		const id: number = client.data.user.id;
		const replier: UserDto = await this.usersService.getUserById(id);
		const otherUser: UserDto = await this.usersService.getUserById(otherId);
		const ret = await this.friendReqService.replyFriendReq(id, otherId, result);

		if (!ret) return (ret);
		result && this.server.to(otherId.toString()).emit('friendReqAccept', replier)
		result && this.server.to(id.toString()).emit('friendReqAccept', otherUser)
		return (ret);
	}

	@SubscribeMessage('reqSent')
	async handleReqSent(
		@ConnectedSocket() client: Socket,
		@MessageBody() otherId: number
	): Promise<boolean> {
		if (typeof otherId != 'number') {
			return false;
		}
		const id: number = client.data.user.id;
		const pendings = await this.friendReqService.getPendingReq(id, otherId);
		if (pendings.length == 0) return (false)
		return (true);
	}
}
