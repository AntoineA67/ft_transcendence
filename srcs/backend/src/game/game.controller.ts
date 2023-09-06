// import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import { GamesService } from './game.service';
// // import { Game } from 'src/entities/game.entity';
// import { game } from '@prisma/client';
// import { Public } from 'src/auth/public.decorator';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Controller('games')
// export class GameController {
//   constructor(private readonly gamesService: GamesService, private readonly prisma: PrismaService) { }

//   @Public()
//   @Get()
//   async getAllGames(): Promise<any> {
//     return await this.gamesService.findAll();
//   }

//   @Public()
//   @Get('test')
//   getTest() {
//     return this.prisma.game.findMany();
//   }

//   @Public()
//   @Post()
//   async createGame(
//     @Body() gameData: any,
//   ): Promise<game> {
//     return await this.gamesService.create(gameData);
//   }

//   // @Get(':id')
//   // async getGameById(@Param('id') id: string): Promise<Game> {
//   //   const game = await this.gamesService.find(Number(id));
//   //   return game;
//   // }

//   // @Post()
//   // async createGame(@Body('name') name: string) {
//   //   if (!name) {
//   //     throw new Error('Content is required !');
//   //   }
//   //   const newGame = await this.gamesService.create(name);
//   //   return newGame;
//   // }
// }
