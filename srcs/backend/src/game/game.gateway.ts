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
  private clients: Map<string, string> = new Map(); // <socketId, gameId>
  private matchmakingQueue: Socket[] = [];
  private rooms: { [id: string]: Room } = {};


  @WebSocketServer() wss: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Player Disconnected: ${client.id} from ${client.rooms}`);
    const room = this.rooms[this.clients[client.id]];
    room.leave(client.id);
    this.clients[client.id] = null
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('client connected', client.id)
    client.emit('id', client.id)
  }

  @SubscribeMessage('match')
  async handleMatch(client: Socket, payload: string): Promise<void> {
    // Add the client ID to the client queue
    this.matchmakingQueue.push(client);
    console.log('matchmakingQueue', this.matchmakingQueue.map((client) => client.id))
    // Check if there are two clients in the client queue
    while (this.matchmakingQueue.length >= 2) {
      // Create a new room for the clients
      const roomId = uuidv4();
      console.log('roomId', roomId)
      const player1 = this.matchmakingQueue.pop();
      const player2 = this.matchmakingQueue.pop();

      player1.join(roomId);
      player2.join(roomId);

      this.clients[player1.id] = roomId;
      this.clients[player2.id] = roomId;

      console.log('player1', player1.id)
      console.log('player2', player2.id)
      this.rooms[roomId] = new Room(roomId, this.wss, player1.id, player2.id);
    }
  }

  @SubscribeMessage('leave')
  async handleLeave(client: Socket, payload: string): Promise<void> {
    console.log('leave', payload)
    const roomId = this.clients[client.id];
    if (roomId) {
      const room = this.rooms[roomId];
      if (room) {
        room.leave(client.id);
        delete this.clients[client.id];
        if (room.isEmpty()) {
          delete this.rooms[roomId];
        }
      }
    }
  }

  // @SubscribeMessage('sendMessage')
  // async handleSendMessage(client: Socket, payload: string): Promise<void> {
  //   this.logger.log('payload', payload);
  //   const newMessage = await this.messagesService.createMessage(payload);
  //   this.wss.emit('receiveMessage', newMessage);
  // }

  @SubscribeMessage('UpKeyPressed')
  async handleUpKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('UpKeyPressed', payload)
    this.rooms[this.clients[client.id]].handleKey(client.id, 1)
  }
  @SubscribeMessage('UpKeyReleased')
  async handleUpKeyReleased(client: Socket, payload: string): Promise<void> {
    this.rooms[this.clients[client.id]].handleKey(client.id, 0)
    console.log('UpKeyReleased', payload)
  }
  @SubscribeMessage('DownKeyPressed')
  async handleDownKeyPressed(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyPressed', payload)
    this.rooms[this.clients[client.id]].handleKey(client.id, -1)
  }
  @SubscribeMessage('DownKeyReleased')
  async handleDownKeyReleased(client: Socket, payload: string): Promise<void> {
    console.log('DownKeyReleased', payload)
    this.rooms[this.clients[client.id]].handleKey(client.id, 0)
  }

}

