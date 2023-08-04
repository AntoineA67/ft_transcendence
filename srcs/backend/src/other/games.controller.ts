import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService } from './games.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() data: any) {
    return this.gameService.create(data);
  }

  @Get()
  findAll() {
    return this.gameService.findAll();
  }
}
