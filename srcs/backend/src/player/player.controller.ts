import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player, Prisma } from '@prisma/client';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

//   @Post()
//   async createPlayer(@Body() data: Prisma.PlayerCreateInput): Promise<Player> {
//     return this.playerService.createPlayer(data);
//   }

//   @Get(':id')
//   async getPlayerById(@Param('id') id: string): Promise<Player> {
//     const playerId = parseInt(id, 10);
//     const player = await this.playerService.getPlayerById(playerId);
//     return player;
//   }

//   @Get()
//   async getAllPlayers(): Promise<Player[]> {
//     return this.playerService.getAllPlayers();
//   }

//   @Put(':id')
//   async updatePlayer(@Param('id') id: string, @Body() data: Prisma.PlayerUpdateInput): Promise<Player | null> {
//     const playerId = parseInt(id, 10);
//     return this.playerService.updatePlayer(playerId, data);
//   }

//   @Delete(':id')
//   async deletePlayer(@Param('id') id: string): Promise<Player | null> {
//     const playerId = parseInt(id, 10);
//     return this.playerService.deletePlayer(playerId);
//   }
}
