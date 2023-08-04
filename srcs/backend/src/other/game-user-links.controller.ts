import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameUserLinkService } from './game-user-links.service';

@Controller('gameUserLinks')
export class GameUserLinkController {
  constructor(private readonly gameUserLinkService: GameUserLinkService) {}

  @Post()
  create(@Body() data: any) {
    return this.gameUserLinkService.create(data);
  }

  @Get()
  findAll() {
    return this.gameUserLinkService.findAll();
  }
}
