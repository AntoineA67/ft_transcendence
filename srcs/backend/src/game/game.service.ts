import { Game, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import Room from './Room.class';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) { }

  private matchmakingQueue: Socket[] = [];
  private clients: Record<string, string> = {};
  private rooms: Record<string, Room> = {};

  addToQueue(socket: Socket, wss: Server) {
    for (let i = 0; i < this.matchmakingQueue.length; i++) {
      if (this.matchmakingQueue[i].data.user.id === socket.data.user.id) {
        console.log('already in queue')
        return;
      }
    }
    this.matchmakingQueue.push(socket);
    this.tryMatchPlayers(wss);
  }

  isInQueue(client: Socket) {
    return this.matchmakingQueue.includes(client);
  }

  disconnect(client: Socket) {
    const roomId = this.clients[client.data.user.id];
    if (roomId) {
      const room = this.rooms[roomId];
      if (room) {
        console.log('leave room', client.data.user.id)
        room.leave(client.data.user.id);
        delete this.clients[client.data.user.id];
        if (room.isEmpty()) {
          delete this.rooms[roomId];
        }
      }
    } else {
      const index = this.matchmakingQueue.indexOf(client);
      if (index !== -1) {
        console.log('removeFromQueue', client.data.user.id)
        this.matchmakingQueue.splice(index, 1);
      }
    }
  }

  handleKeysPresses(clientId: string, keysPressed: { up: boolean, down: boolean, time: number }) {
    console.log(this.clients)
    this.rooms[this.clients[clientId]].handleKey(clientId, keysPressed)
  }

  private tryMatchPlayers(wss) {
    while (this.matchmakingQueue.length >= 2) {
      // Create a new room for the clients
      const roomId = uuidv4();
      console.log('roomId', roomId)
      const player1 = this.matchmakingQueue.pop();
      const player2 = this.matchmakingQueue.pop();

      player1.join(roomId);
      player2.join(roomId);

      this.clients[player1.data.user.id] = roomId;
      this.clients[player2.data.user.id] = roomId;

      console.log('player1', player1.id, player1.data.user.id)
      console.log('player2', player2.id, player2.data.user.id)

      this.rooms[roomId] = new Room(roomId, wss, player1, player2);
    }
  }

  async findAll(): Promise<any> {
    return await this.prisma.game.findMany();
  }

  // async find(
  //   gameWhereUniqueInput: Prisma.gameWhereUniqueInput,
  // ): Promise<game | null> {
  //   return this.prisma.game.findUnique({
  //     where: gameWhereUniqueInput,
  //   });
  // }

  async create(data: Prisma.GameCreateInput): Promise<Game> {
    return await this.prisma.game.create({
      data: {
        start_date: new Date(Date.now()).toISOString(),
      }
    });
  }

  // update
  async update(id: number, data: Prisma.GameUpdateInput): Promise<Game> {
    return await this.prisma.game.update({
      where: { id },
      data,
    });
  }
}
