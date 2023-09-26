import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Room, Prisma, Message } from '@prisma/client';

type MessageWithUsername = {
  id: number;
  message: string;
  send_date: Date;
  userId: number;
  roomId: number;
  username: string;
};

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(data: Prisma.RoomCreateInput): Promise<Room> {
    return this.prisma.room.create({ data });
  }

  // async getRoomById(id: number): Promise<Room> {
  //   const room = await this.prisma.room.findUnique({
  //     where: {
  //       id,
  //     },
  //   });
  //   if (!room) {
  //     throw new NotFoundException('Room not found');
  //   }
  //   return room;
  // }

  async getAllRooms(): Promise<Room[]> {
    return this.prisma.room.findMany();
  }

  async getAllRoomsByUserid(id: number): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: id,
          },
        },
      },
    });
    return rooms;
  }

  async getRoomData(roomid: number, userid: number): Promise<{ messages: MessageWithUsername[], roomTitle: string }> {
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomid,
        members: {
          some: {
            userId: userid,
          },
        },
      },
      include: {
        message: {
          include: {
            user: { // Include the user associated with the message
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    if (!room) {
      return { messages: [], roomTitle: '' };
    }
    const messagesWithUsername = room.message.map((message) => ({
      id: message.id,
      message: message.message,
      send_date: message.send_date,
      userId: message.userId,
      roomId: message.roomId,
      username: message.user.username, // Access the username from the included user
    }));
    return { messages: messagesWithUsername, roomTitle: room.title };
  }

  async updateRoom(id: number, data: Prisma.RoomUpdateInput): Promise<Room | null> {
    const existingRoom = await this.prisma.room.findUnique({ where: { id } });
    if (!existingRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async deleteRoom(id: number): Promise<Room | null> {
    const existingRoom = await this.prisma.room.findUnique({ where: { id } });
    if (!existingRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return this.prisma.room.delete({ where: { id } });
  }
}
