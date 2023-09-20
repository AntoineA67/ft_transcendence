import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendRequestService } from './friendrequest.service';

@WebSocketGateway({ cors: true })
export class FriendRequestGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
	// Gestion de la connexion du client
	}

	handleDisconnect(client: Socket) {
	// Gestion de la déconnexion du client
	}

	constructor(private readonly friendReqService: FriendRequestService) { }

	@SubscribeMessage('findAllPendings')
	async handleFindAllPendings(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (this.friendReqService.findAllPendings(id));
	}

	@SubscribeMessage('sendReq')
	async handleSendReq(@ConnectedSocket() client: Socket, @MessageBody() data: string) {

	}
	
	@SubscribeMessage('replyReq')
	async handleReplyReq(@ConnectedSocket() client: Socket, @MessageBody() data: string) {

	}
}
