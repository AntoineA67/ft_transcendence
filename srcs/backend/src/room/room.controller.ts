import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room, Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { MemberService } from 'src/member/member.service';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly memberService: MemberService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getRoomDataById(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user.id;
    const roomId = parseInt(id, 10);
    if (!roomId || Number.isNaN(roomId) || roomId > 100000 || roomId <= 0)
      return null;
    const memberStatus = await this.memberService.getMemberDatabyRoomId(userId, roomId);
    const members = await this.memberService.getMembersByRoomId(roomId);
    if (!memberStatus || memberStatus.ban) {
      throw new HttpException('You are banned or not a member', HttpStatus.FORBIDDEN);
    }
    const roomData = await this.roomService.getRoomData(roomId, userId);
		const profile = await this.roomService.getProfileForUser(userId);
    return {
      ...roomData,
      members,
      memberStatus,
      profile
    };
  }

}
