import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Friendship, Prisma } from '@prisma/client';

@Controller('api/friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

 


  
}
