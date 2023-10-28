import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './game.service';
import { Game } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('games')
export class GameController {
  constructor(private readonly gamesService: GamesService, private readonly prisma: PrismaService) { }

  @Public()
  @Get()
  async getAllGames(): Promise<any> {
    return await this.gamesService.findAll();
  }

  @Public()
  @Get('test')
  getTest() {
    return this.prisma.game.findMany();
  }

  @Public()
  @Post()
  async createGame(
    @Body() gameData: any,
  ): Promise<Game> {
    return await this.gamesService.create(gameData);
  }
}
