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
  async getFriendshipById(@Param('id') id: string): Promise<Friendship> {
    const friendshipId = parseInt(id, 10);
    const friendship = await this.friendshipService.getFriendshipById(friendshipId);
    return friendship;
  }

  @Get()
  async getAllFriendships(): Promise<Friendship[]> {
    return this.friendshipService.getAllFriendships();
  }

  @Put(':id')
  async updateFriendship(@Param('id') id: string, @Body() data: Prisma.FriendshipUpdateInput): Promise<Friendship | null> {
    const friendshipId = parseInt(id, 10);
    return this.friendshipService.updateFriendship(friendshipId, data);
  }

  @Delete(':id')
  async deleteFriendship(@Param('id') id: string): Promise<Friendship | null> {
    const friendshipId = parseInt(id, 10);
    return this.friendshipService.deleteFriendship(friendshipId);
  }
}
