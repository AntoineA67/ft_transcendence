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

  addToQueue(client: Socket, wss: Server) {
    this.matchmakingQueue.push(client);
    console.log('matchmakingQueue', this.matchmakingQueue.map((client) => client.id));
    this.tryMatchPlayers(wss);
  }

  isInQueue(client: Socket) {
    return this.matchmakingQueue.includes(client);
  }
  disconnect(client: Socket) {
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
    } else {
      const index = this.matchmakingQueue.indexOf(client);
      if (index !== -1) {
        console.log('removeFromQueue', client.id)
        this.matchmakingQueue.splice(index, 1);
      }
    }
  }

  handleKeysPresses(clientId: string, keysPressed: { up: boolean, down: boolean, time: number }) {
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

      this.clients[player1.id] = roomId;
      this.clients[player2.id] = roomId;

      console.log('player1', player1.id)
      console.log('player2', player2.id)
      this.rooms[roomId] = new Room(roomId, wss, player1.id, player2.id);
    }
  }

  async findAll(): Promise<any> {
    const games = await this.prisma.game.findMany()
    console.log("oui", games)
    return games;
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
}
