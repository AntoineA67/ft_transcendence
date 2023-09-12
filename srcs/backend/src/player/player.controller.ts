import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Player, Prisma } from '@prisma/client';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async createPlayer(@Body() data: Prisma.PlayerCreateInput): Promise<Player> {
    return this.playerService.createPlayer(data);
  }

  @Get(':id')
  async getPlayerById(@Param('id') id: number): Promise<Player | null> {
    return this.playerService.getPlayerById(id);
  }

  @Get()
  async getAllPlayers(): Promise<Player[]> {
    return this.playerService.getAllPlayers();
  }

  @Put(':id')
  async updatePlayer(@Param('id') id: number, @Body() data: Prisma.PlayerUpdateInput): Promise<Player | null> {
    return this.playerService.updatePlayer(id, data);
  }

  @Delete(':id')
  async deletePlayer(@Param('id') id: number): Promise<Player | null> {
    return this.playerService.deletePlayer(id);
  }
}
