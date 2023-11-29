import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getRoomDataById(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = req.user.id;
      if (!userId)
        return { message: 'Invalid user id' };
      if (!id || typeof id !== 'string')
        return { message: 'Invalid room id' };
      const roomId = parseInt(id, 10);
      if (!roomId || Number.isNaN(roomId) || roomId > 100000 || roomId <= 0)
        return { message: 'Invalid room id' };
      const memberStatus = await this.roomService.getMemberDatabyRoomId(userId, roomId);
      const members = await this.roomService.getMembersByRoomId(roomId);
      if (!memberStatus || memberStatus.ban)
        return { message: 'You are not allowed to access this room' };
      const roomData = await this.roomService.getRoomData(roomId, userId);
      const profile = await this.roomService.getProfileForUser(userId);
      return {
        ...roomData,
        members,
        memberStatus,
        profile
      };
    }
    catch (err) {
      return { message: err.message };
    }
  }
}
