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
  private matches: { senderId: { receiverId: string, sender: Socket, receiver: Socket } } | {} = {};


  async matchAgainst(socket: Socket, wss: Server, payload: string) {
    // console.log(`Trying match ${socket.data.user.id} against ${payload}`)
    const sockets = await wss.fetchSockets();
    if (this.matches[payload] && this.matches[payload].receiverId == socket.data.user.id) {
      delete this.matches[payload];
      // console.log("LAUNCHING MATCH " + payload + " " + socket.data.user.id)
      for (let s of sockets) {
        if (s.data.user.id == payload) {
          this.matchmakePlayers(wss, socket, s as unknown as Socket);
          break;
        }
      }
    } else {
      for (let s of sockets) {
        if (s.data.user.id == payload) {
          s.emit('ponged', { nick: "", id: socket.data.user.id })
          this.matches[socket.data.user.id] = { receiverId: payload, sender: socket, receiver: s };
          console.log(`Matched ${socket.data.user.id} with ${payload}, now matches are ${this.matches.toString()}`)
          break;
        }
      }
    }
  }

  addToQueue(socket: Socket, wss: Server) {
    for (let i = 0; i < this.matchmakingQueue.length; i++) {
      if (this.matchmakingQueue[i].data.user.id === socket.data.user.id) {
        // console.log('already in queue')
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
    console.log('disconnect', client.data.user.id)
    const userId = client.data.user.id;
    const roomId = this.clients[userId];
    if (roomId) {
      const room = this.rooms[roomId];
      if (room) {
        // console.log('leave room', userId)
        if (room.isEmpty()) return;
        room.leave(userId).then(() => {
          delete this.clients[userId];
          if (room.isEmpty()) {
            delete this.rooms[roomId];
          }
        });
      }
    } else if (this.isInQueue(client)) {
      const index = this.matchmakingQueue.indexOf(client);
      if (index !== -1) {
        // console.log('removeFromQueue', userId)
        this.matchmakingQueue.splice(index, 1);
      }
    } else if (this.matches[userId]) {
      console.log('cancelledMatchmake', userId, this.matches[userId])
      this.matches[userId].receiver.emit('cancelledMatchmake');
      // delete this.matches[this.matches[userId]];
      delete this.matches[userId];
    }
  }

  handleKeysPresses(clientId: string, keysPressed: { up: boolean, down: boolean, time: number }) {
    // console.log(this.clients)
    this.rooms[this.clients[clientId]].handleKey(clientId, keysPressed)
  }

  private tryMatchPlayers(wss) {
    while (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.pop();
      const player2 = this.matchmakingQueue.pop();

      // Create a new room for the clients
      const roomId = uuidv4();
      console.log('roomId', roomId)

      player1.join(roomId);
      player2.join(roomId);

      this.clients[player1.data.user.id] = roomId;
      this.clients[player2.data.user.id] = roomId;

      console.log('player1', player1.id, player1.data.user.id)
      console.log('player2', player2.id, player2.data.user.id)

      this.rooms[roomId] = new Room(roomId, wss, player1, player2);
    }
  }

  public matchmakePlayers(wss, player1: Socket, player2: Socket) {

    // Create a new room for the clients
    const roomId = uuidv4();
    console.log('roomId', roomId)

    player1.join(roomId);
    player2.join(roomId);

    this.clients[player1.data.user.id] = roomId;
    this.clients[player2.data.user.id] = roomId;

    console.log('player1', player1.id, player1.data.user.id)
    console.log('player2', player2.id, player2.data.user.id)

    this.rooms[roomId] = new Room(roomId, wss, player2, player1);
  }

  async findAll(): Promise<any> {
    return await this.prisma.game.findMany();
  }

  async create(data: Prisma.GameCreateInput): Promise<Game> {
    return await this.prisma.game.create({
      data: {
        start_date: new Date(Date.now()).toISOString(),
      }
    });
  }

  async update(id: number, data: Prisma.GameUpdateInput): Promise<Game> {
    return await this.prisma.game.update({
      where: { id },
      data,
    });
  }
}
