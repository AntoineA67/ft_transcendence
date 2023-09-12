import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { FriendRequest, Prisma } from '@prisma/client';

@Controller('friendrequests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  async createFriendRequest(@Body() data: Prisma.FriendRequestCreateInput): Promise<FriendRequest> {
    return this.friendRequestService.createFriendRequest(data);
  }

  @Get(':id')
  async getFriendRequestById(@Param('id') id: number): Promise<FriendRequest | null> {
    return this.friendRequestService.getFriendRequestById(id);
  }

  @Get()
  async getAllFriendRequests(): Promise<FriendRequest[]> {
    return this.friendRequestService.getAllFriendRequests();
  }

  @Put(':id')
  async updateFriendRequest(@Param('id') id: number, @Body() data: Prisma.FriendRequestUpdateInput): Promise<FriendRequest | null> {
    return this.friendRequestService.updateFriendRequest(id, data);
  }

  @Delete(':id')
  async deleteFriendRequest(@Param('id') id: number): Promise<FriendRequest | null> {
    return this.friendRequestService.deleteFriendRequest(id);
  }
}
