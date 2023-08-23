import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoomUserLinkService } from './room-user-links.service';

@Controller('roomUserLinks')
export class RoomUserLinkController {
  constructor(private readonly roomUserLinkService: RoomUserLinkService) {}

  @Post()
  create(@Body() data: any) {
    return this.roomUserLinkService.create(data);
  }

  @Get()
  findAll() {
    return this.roomUserLinkService.findAll();
  }
}
