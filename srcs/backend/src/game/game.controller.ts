import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './game.service';
import { Game } from 'src/entities/game.entity';

@Controller('games')
export class GameController {
  constructor(private readonly gamesService: GamesService) { }

  @Get()
  async getAllGames(): Promise<Game[]> {
    const games = await this.gamesService.findAll();
    return games;
  }

  @Get(':id')
  async getGameById(@Param('id') id: string): Promise<Game> {
    const game = await this.gamesService.find(Number(id));
    return game;
  }

  @Post()
  async createGame(@Body('name') name: string) {
    if (!name) {
      throw new Error('Content is required !');
    }
    const newGame = await this.gamesService.create(name);
    return newGame;
  }
}
