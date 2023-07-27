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
  ball: {};
}

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesService: MessagesService) { }

  private logger: Logger = new Logger('MessageGateway');
  private clients: any = {}
  private ball: any = {}

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
    setInterval(() => {
      // console.log('sending clients')
      this.wss.emit('clients', { 'clients': this.clients, 'ball': this.ball });
    }, 50);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    if (this.clients && this.clients[client.id]) {
      console.log('deleting ' + client.id)
      delete this.clients[client.id]
      this.wss.emit('removeClient', client.id)
      if (Object.keys(this.clients).length !== 2) {
        this.wss.emit('ball', 'non')
        console.log('removeBall')
      }
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.clients[client.id] = {}
    client.emit('id', client.id)
    if (Object.keys(this.clients).length === 2) {
      client.emit('ball', 'oui')
      console.log('ball')
    }
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
      if (payload.ball) {
        this.ball = payload.ball
      }
      // if (!this.clients[client.id].t || (payload.t - this.clients[client.id].t < 500 && payload.t - this.clients[client.id].t > 0)) {
      // }
      // console.log(payload.t - this.clients[client.id].t)
      // console.log(this.clients[client.id])
      // this.wss.emit('clients', this.clients);
    }
  }
}
