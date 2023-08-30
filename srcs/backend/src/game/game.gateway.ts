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
import { GamesService } from './game.service';
import { v4 as uuidv4 } from 'uuid';
import Player from './Player.class';
import Ball from './Ball.class';
import Room from './Room.class';

@WebSocketGateway({ cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly gamesService: GamesService) { }

  private logger: Logger = new Logger('Game Gateway');

  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Player Disconnected: ${client.id} from ${client.rooms}`);
    this.gamesService.disconnect(client);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected', client.id)
    client.emit('id', client.id)
  }

  @SubscribeMessage('match')
  async handleMatch(client: Socket, payload: string): Promise<void> {
    this.gamesService.addToQueue(client, this.wss);
  }

  @SubscribeMessage('leave')
  async handleLeave(client: Socket, payload: string): Promise<void> {
    this.gamesService.disconnect(client);
  }

  @SubscribeMessage('UpKeyPressed')
  async handleUpKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyPressed', payload)
    this.gamesService.keyPressed(client.id, 1);
    // this.rooms[this.clients[client.id]].handleKey(client.id, 1)
  }
  @SubscribeMessage('UpKeyReleased')
  async handleUpKeyReleased(client: Socket, payload: string): Promise<void> {
    this.gamesService.keyPressed(client.id, 0);
    // this.rooms[this.clients[client.id]].handleKey(client.id, 0)
    console.log('UpKeyReleased', payload)
  }
  @SubscribeMessage('DownKeyPressed')
  async handleDownKeyPressed(client: Socket, payload: string): Promise<void> {
    this.gamesService.keyPressed(client.id, -1);
    console.log('DownKeyPressed', payload)
    // this.rooms[this.clients[client.id]].handleKey(client.id, -1)
  }
  @SubscribeMessage('DownKeyReleased')
  async handleDownKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyReleased', payload)
    this.gamesService.keyPressed(client.id, 0);
    // this.rooms[this.clients[client.id]].handleKey(client.id, 0)
  }

}

