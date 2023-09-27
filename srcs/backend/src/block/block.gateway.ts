import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockService } from './block.service';

@WebSocketGateway()
export class BlockGateway {
 
	constructor(private readonly blockService: BlockService) {};

	@SubscribeMessage('findAllBlocks')
	async handleFindAllBlocks(@ConnectedSocket() client: Socket) {
		const id: number = client.data.user.id;
		return (await this.blockService.getAllBlocked(id))
	}
	
	@SubscribeMessage('block')
	async handleBlock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number) {
		const id: number = client.data.user.id;
		return (await this.blockService.createBlock(id, otherId));
		}
		
	@SubscribeMessage('unblock')
	async handleUnblock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number) {
		const id: number = client.data.user.id;
		return (await this.blockService.unBlock(id, otherId));
	}
		
	@SubscribeMessage('')
	async handle(
		@ConnectedSocket() client: Socket, 
		@MessageBody() otherId: number) {
		const id: number = client.data.user.id;
		return (await this.blockService.isBlocked(id, otherId));
	}
	
}
