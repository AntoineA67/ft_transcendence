import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true, namespace: 'chats'  })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesService: MessagesService) { }

  private logger: Logger = new Logger('MessageGateway');
  private clients: any = {};

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
  }

  handleDisconnect(client: Socket) {
    if (this.clients && this.clients[client.id]) {
      delete this.clients[client.id];
      this.server.emit('removeClient', client.id);
    }
  }

  handleConnection(client: Socket) {
    this.clients[client.id] = {};
    this.server.emit('id', client.id);
  }
}
