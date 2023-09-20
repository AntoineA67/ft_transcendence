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
		@MessageBody() nick: string) {
		const id: number = client.data.user.id;
		return (await this.blockService.createBlock(id, nick));
		}
		
	@SubscribeMessage('unblock')
	async handleUnblock(
		@ConnectedSocket() client: Socket, 
		@MessageBody() nick: string) {
		const id: number = client.data.user.id;
		return (await this.blockService.unBlock(id, nick));
	}
		
	@SubscribeMessage('')
	async handle(
		@ConnectedSocket() client: Socket, 
		@MessageBody() nick: string) {
		const id: number = client.data.user.id;
		return (await this.blockService.isBlocked(id, nick));
	}
	
}
