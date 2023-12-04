import { Game, OnlineStatus, Prisma } from '@prisma/client';
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


  async cancelMatchmake(socket: Socket, wss: Server, otherIdDTO: string) {
    let otherIdNumber;
    try {
      otherIdNumber = parseInt(otherIdDTO);
      const otherUser = await this.prisma.user.findUnique({ where: { id: otherIdNumber } });
      if (otherUser === null) throw new Error('user not online');
    } catch (error) {
      socket.emit('cancelledMatchmake');
      await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'ONLINE' } });
      return;
    }
    if (this.matches[otherIdDTO] && this.matches[otherIdDTO].receiverId === socket.data.user.id) {
      this.matches[otherIdDTO].sender.emit('cancelledMatchmake');
      await this.prisma.user.update({ where: { id: otherIdNumber }, data: { status: 'ONLINE' } });
      delete this.matches[otherIdDTO];
    }
  }

  async checkUserInGame(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User does not exist');
    if (this.isInQueue(userId) || user.status == 'INGAME') throw new Error('Already in game');
    if (this.matches[userId.toString()]) throw new Error('Already in private game');
  }

  async matchAgainst(socket: Socket, wss: Server, otherIdDTO: { id: string }) {
    const otherId = otherIdDTO.id;
    let otherIdNumber;
    try {
      otherIdNumber = parseInt(otherId);
      if (otherIdNumber === socket.data.user.id) throw new Error('cannot matchmake against yourself');
      if (this.isInQueue(otherIdNumber)) throw new Error('other user already in queue');
      const otherUser = await this.prisma.user.findUnique({ where: { id: otherIdNumber } });

      if (!otherUser) throw new Error('Other user not exists');
      const user = await this.prisma.user.findUnique({ where: { id: socket.data.user.id } });
      if (this.isInQueue(socket.data.user.id) || user.status == 'INGAME') throw new Error('Already in game');
      await this.checkUserInGame(socket.data.user.id);

    } catch (error) {
      socket.emit('cancelledMatchmake');
      await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'ONLINE' } });
      return;
    }
    const sockets = await wss.fetchSockets();
    if (this.matches[otherId] && this.matches[otherId].receiverId === socket.data.user.id) {
      delete this.matches[otherId];
      for (let s of sockets) {
        if (s.data.user.id === otherIdNumber) {
          this.matchmakePlayers(wss, socket, s as unknown as Socket);
          break;
        }
      }
    } else {
      for (let match in this.matches) {
        if (this.matches[match].receiverId === otherIdNumber) {
          socket.emit('cancelledMatchmake', { reason: 'user already matched' });
          await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'ONLINE' } });
          return;
        }
      }
      for (let s of sockets) {
        if (s.data.user.id === otherIdNumber) {
          const otherUser = await this.prisma.user.findUnique({ where: { id: otherIdNumber } });
          if (otherUser.status == 'INGAME') {
            socket.emit('cancelledMatchmake', { reason: 'Other user already in game' });
            await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'ONLINE' } });
            return;
          }
          const username = (await this.prisma.user.findUnique({ where: { id: socket.data.user.id }, select: { username: true } })).username;
          await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'INGAME' } });
          s.emit('ponged', { nick: username, id: socket.data.user.id })
          this.matches[socket.data.user.id] = { receiverId: otherId, sender: socket, receiver: s };
          break;
        }
      }
    }
  }

  async addToQueue(socket: Socket, wss: Server) {
    await this.checkUserInGame(socket.data.user.id);
    this.matchmakingQueue.push(socket);
    await this.prisma.user.update({ where: { id: socket.data.user.id }, data: { status: 'INGAME' } });
    this.tryMatchPlayers(wss);
  }

  isInQueue(userid: number): boolean {
    return this.matchmakingQueue.some((client) =>
      client.data.user.id == userid
    )
  }

  async disconnect(client: Socket) {
    try {
      const userId = client.data.user.id;
      const userIdString = userId.toString()
      const roomId = this.clients[userId];
      if (roomId) {
        const room = this.rooms[roomId];
        if (room) {
          if (room.isEmpty()) return;
          room.leave(userId).then(() => {
            delete this.clients[userId];
            if (room.isEmpty()) {
              delete this.rooms[roomId];
            }
          });
        }
      }
      if (this.isInQueue(client.data.user.id)) {
        const index = this.matchmakingQueue.indexOf(client);
        if (index !== -1) {
          this.matchmakingQueue.splice(index, 1);
        }
      } else if (this.matches[userIdString]) {
        this.matches[userIdString].receiver.emit('cancelledMatchmake');
        this.matches[userIdString].sender.emit('cancelledMatchmake');
        delete this.matches[userIdString];
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'ONLINE' } });
      }
      await this.prisma.user.update({ where: { id: client.data.user.id }, data: { status: 'ONLINE' } });
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  handleKeysPresses(clientId: string, keysPressed: { up: boolean, down: boolean, time: number }) {
    try {
      // Will catch if the client is not in a room
      this.rooms[this.clients[clientId]].handleKey(clientId, keysPressed)
    } catch (error) {
      return;
    }
  }

  private async tryMatchPlayers(wss) {
    while (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.pop();
      const player2 = this.matchmakingQueue.pop();
      if (!player1 || !player2) return;
      if (player1.data.user.id === player2.data.user.id) return;

      // Create a new room for the clients
      const roomId = uuidv4();

      try {
        player1.join(roomId);
        player2.join(roomId);
        this.clients[player1.data.user.id] = roomId;
        this.clients[player2.data.user.id] = roomId;
      } catch (error) {
        player1.emit('cancelledMatchmake');
        player2.emit('cancelledMatchmake');
        return;
      }

      this.rooms[roomId] = new Room(roomId, wss, player1, player2);
      await this.prisma.user.update({ where: { id: player1.data.user.id }, data: { status: 'INGAME' } });
      await this.prisma.user.update({ where: { id: player2.data.user.id }, data: { status: 'INGAME' } });
    }
  }

  public async matchmakePlayers(wss, player1: Socket, player2: Socket) {

    // Create a new room for the clients
    const roomId = uuidv4();

    player1.join(roomId);
    player2.join(roomId);

    this.clients[player1.data.user.id] = roomId;
    this.clients[player2.data.user.id] = roomId;

    await this.prisma.user.update({ where: { id: player1.data.user.id }, data: { status: 'INGAME' } });
    await this.prisma.user.update({ where: { id: player2.data.user.id }, data: { status: 'INGAME' } });


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
