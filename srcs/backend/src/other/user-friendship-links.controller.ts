import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserFriendshipLinkService } from './user-friendship-links.service';

@Controller('userFriendshipLinks')
export class UserFriendshipLinkController {
  constructor(private readonly userFriendshipLinkService: UserFriendshipLinkService) {}

  @Post()
  create(@Body() data: any) {
    return this.userFriendshipLinkService.create(data);
  }

  @Get()
  findAll() {
    return this.userFriendshipLinkService.findAll();
  }
}
