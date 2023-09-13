import { Controller, Get, Post, Param, Body, Put, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room, Prisma } from '@prisma/client';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() data: Prisma.RoomCreateInput): Promise<Room> {
    return this.roomService.createRoom(data);
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string): Promise<Room> {
    const roomId = parseInt(id, 10);
    const room = await this.roomService.getRoomById(roomId);
    return room;
  }

  @Get()
  async getAllRooms(): Promise<Room[]> {
    return this.roomService.getAllRooms();
  }

  @Put(':id')
  async updateRoom(@Param('id') id: string, @Body() data: Prisma.RoomUpdateInput): Promise<Room | null> {
    const roomId = parseInt(id, 10);
    return this.roomService.updateRoom(roomId, data);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string): Promise<Room | null> {
    const roomId = parseInt(id, 10);
    return this.roomService.deleteRoom(roomId);
  }
}
