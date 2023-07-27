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
  private ball: any = null

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
    setInterval(() => {
      Object.keys(this.clients).forEach((key) => {
        const client = this.clients[key]
        if (client.direction) {
          client.y += client.direction * .01
          if (client.y < 0) {
            client.y = 0
          }
          if (client.y > 1) {
            client.y = 1
          }
        }
      })
      if (this.ball) {
        this.ball.x += this.ball.velocityX
        this.ball.y += this.ball.velocityY
        if (this.ball.y < 0) {
          this.ball.y = 0
          this.ball.velocityY = -this.ball.velocityY
        }
        if (this.ball.y > 1) {
          this.ball.y = 1
          this.ball.velocityY = -this.ball.velocityY
        }
        if (this.ball.x < 0 || this.ball.x > 1) {
          this.ball = {
            'x': .5,
            'y': .5,
            'velocityX': Math.random() > .5 ? .01 : -.01,
            'velocityY': 0,
          }
        }
        Object.keys(this.clients).forEach((key) => {
          const client = this.clients[key]
          if (Math.abs(this.ball.x - client.y) > .02) {
            return
          }
          let collidePoint = this.ball.y - (client.y + .5);
          collidePoint = collidePoint / (client.y / 2);
          const angleRad = (Math.PI / 4) * collidePoint;
          const direction = this.ball.x < .5 ? 1 : -1;

          this.ball.velocityX = direction * .01 * Math.cos(angleRad);
          this.ball.velocityY = .1 * Math.sin(angleRad);
        })
      }
      this.wss.emit('clients', { 'clients': this.clients, 'ball': this.ball });
    }, 50);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
    if (this.clients && this.clients[client.id]) {
      console.log('deleting ' + client.id)
      delete this.clients[client.id]
      this.wss.emit('removeClient', client.id)
      // if (Object.keys(this.clients).length !== 2) {
      //   this.wss.emit('ball', 'non')
      //   console.log('removeBall')
      // }
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected: ${client.id}`);
    this.clients[client.id] = { 'y': .5, 'direction': null }
    client.emit('id', client.id)
    if (Object.keys(this.clients).length === 2) {
      this.ball = {
        'x': .5,
        'y': .5,
        'velocityX': Math.random() > .5 ? .1 : -.1,
        'velocityY': 0,
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    this.logger.log('payload', payload);
    const newMessage = await this.messagesService.createMessage(payload);
    this.wss.emit('receiveMessage', newMessage);
  }
  @SubscribeMessage('UpKeyPressed')
  async handleUpKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyPressed', payload)
    this.clients[client.id].direction = 1
  }
  @SubscribeMessage('UpKeyReleased')
  async handleUpKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyReleased', payload)
    this.clients[client.id].direction = 0
  }
  @SubscribeMessage('DownKeyPressed')
  async handleDownKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyPressed', payload)
    this.clients[client.id].direction = -1
  }
  @SubscribeMessage('DownKeyReleased')
  async handleDownKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyReleased', payload)
    this.clients[client.id].direction = 0
  }
  // @SubscribeMessage('update')
  // async handleUpdate(client: Socket, payload: ClientUpdate): Promise<void> {
  //   //  await new Promise(resolve => setTimeout(resolve, 100))
  //   // console.log('update', payload)
  //   if (this.clients[client.id]) {
  //     this.clients[client.id].p = payload.p //position
  //     this.clients[client.id].r = payload.r //rotation
  //     this.clients[client.id].t = payload.t //client timestamp
  //     if (payload.ball) {
  //       this.ball = payload.ball
  //     }
  //     // if (!this.clients[client.id].t || (payload.t - this.clients[client.id].t < 500 && payload.t - this.clients[client.id].t > 0)) {
  //     // }
  //     // console.log(payload.t - this.clients[client.id].t)
  //     // console.log(this.clients[client.id])
  //     // this.wss.emit('clients', this.clients);
  //   }
  // }
}
