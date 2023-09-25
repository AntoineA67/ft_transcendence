import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Room, Prisma, Message } from '@prisma/client';

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

  async getMessagesByRoomId(roomid: number): Promise<Message[]> {
    const room = await this.prisma.room.findMany({
      where: {
        id: roomid,
      },
      include: {
        message: true,
      },
    });
    if (room.length === 0) {
      return [];
    }
    return room[0].message;
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
