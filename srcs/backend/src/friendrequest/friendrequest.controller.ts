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
  async getFriendRequestById(@Param('id') id: string): Promise<FriendRequest> {
    const requestId = parseInt(id, 10);
    const request = await this.friendRequestService.getFriendRequestById(requestId);
    return request;
  }

  @Get()
  async getAllFriendRequests(): Promise<FriendRequest[]> {
    return this.friendRequestService.getAllFriendRequests();
  }

  @Put(':id')
  async updateFriendRequest(@Param('id') id: string, @Body() data: Prisma.FriendRequestUpdateInput): Promise<FriendRequest | null> {
    const requestId = parseInt(id, 10);
    return this.friendRequestService.updateFriendRequest(requestId, data);
  }

  @Delete(':id')
  async deleteFriendRequest(@Param('id') id: string): Promise<FriendRequest | null> {
    const requestId = parseInt(id, 10);
    return this.friendRequestService.deleteFriendRequest(requestId);
  }
}
