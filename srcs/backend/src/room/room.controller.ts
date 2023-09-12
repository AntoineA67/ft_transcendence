import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() data: any) {
    return this.roomService.create(data);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }
}
