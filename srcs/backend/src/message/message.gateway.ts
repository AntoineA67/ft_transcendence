import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesService: MessagesService) { }

  private logger: Logger = new Logger('MessageGateway');
  private clients: any = {};

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Messages Initializedd');
    // setInterval(() => {
    // this.wss.emit('clients', this.clients);
    // }, 50);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    if (this.clients && this.clients[client.id]) {
      delete this.clients[client.id];
      this.wss.emit('removeClient', client.id);
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.clients[client.id] = {};
    this.wss.emit('id', client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
    const newMessage = await this.messagesService.createMessage(payload);
    const allMessages = await this.messagesService.getAllMessages();
    this.wss.emit('receiveMessage', allMessages);
  }
}
