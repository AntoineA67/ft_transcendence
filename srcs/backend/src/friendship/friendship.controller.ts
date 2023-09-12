import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Friendship, Prisma } from '@prisma/client';

@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  async createFriendship(@Body() data: Prisma.FriendshipCreateInput): Promise<Friendship> {
    return this.friendshipService.createFriendship(data);
  }

  @Get(':id')
  async getFriendshipById(@Param('id') id: number): Promise<Friendship | null> {
    return this.friendshipService.getFriendshipById(id);
  }

  @Get()
  async getAllFriendships(): Promise<Friendship[]> {
    return this.friendshipService.getAllFriendships();
  }

  @Put(':id')
  async updateFriendship(@Param('id') id: number, @Body() data: Prisma.FriendshipUpdateInput): Promise<Friendship | null> {
    return this.friendshipService.updateFriendship(id, data);
  }

  @Delete(':id')
  async deleteFriendship(@Param('id') id: number): Promise<Friendship | null> {
    return this.friendshipService.deleteFriendship(id);
  }
}
