import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { FriendRequest, Prisma } from '@prisma/client';

@Controller('friendrequests')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  
}
