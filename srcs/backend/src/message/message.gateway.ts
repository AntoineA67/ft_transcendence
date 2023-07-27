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
import { resolve } from 'path';

interface ClientUpdate {
  t: number; //timestamp
  p: { x: number, y: number, z: number }; //position
  r: { isEuleur: boolean, _x: number, _y: number, _z: number, _order: string }; //rotation
}

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesService: MessagesService) { }

  private logger: Logger = new Logger('MessageGateway');
  private clients: any = {}

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
    setInterval(() => {
      // console.log('sending clients')
      this.wss.emit('clients', this.clients);
    }, 50);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    if (this.clients && this.clients[client.id]) {
      console.log('deleting ' + client.id)
      delete this.clients[client.id]
      this.wss.emit('removeClient', client.id)
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.clients[client.id] = {}
    this.wss.emit('id', client.id)
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    this.logger.log('payload', payload);
    const newMessage = await this.messagesService.createMessage(payload);
    this.wss.emit('receiveMessage', newMessage);
  }
  @SubscribeMessage('update')
  async handleUpdate(client: Socket, payload: ClientUpdate): Promise<void> {
    //  await new Promise(resolve => setTimeout(resolve, 100))
    // console.log('update', payload)
    if (this.clients[client.id]) {
      this.clients[client.id].p = payload.p //position
      this.clients[client.id].r = payload.r //rotation
      this.clients[client.id].t = payload.t //client timestamp
      // if (!this.clients[client.id].t || (payload.t - this.clients[client.id].t < 500 && payload.t - this.clients[client.id].t > 0)) {
      // }
      // console.log(payload.t - this.clients[client.id].t)
      // console.log(this.clients[client.id])
      // this.wss.emit('clients', this.clients);
    }
  }
}
