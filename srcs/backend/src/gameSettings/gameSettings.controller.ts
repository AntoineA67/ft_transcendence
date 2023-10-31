import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { GameSettingsService } from './gameSettings.service';
import { GameSettings, Prisma } from '@prisma/client';

@Controller('gameSettings')
export class GameSettingsController {
  constructor(private readonly gameSettingsService: GameSettingsService) { }

  @Post()
  async createGameSettings(@Body() data: Prisma.GameSettingsCreateInput): Promise<GameSettings> {
    return this.gameSettingsService.createGameSettings(data);
  }

  @Get(':id')
  async getGameSettingsById(@Param('id') id: string): Promise<GameSettings> {
    const gameSettingsId = parseInt(id, 10);
    const gameSettings = await this.gameSettingsService.getGameSettingsById(gameSettingsId);
    return gameSettings;
  }

  @Get()
  async getAllGameSettingss(): Promise<GameSettings[]> {
    return this.gameSettingsService.getAllGameSettingss();
  }

  @Put(':id')
  async updateGameSettings(@Param('id') id: string, @Body() data: Prisma.GameSettingsUpdateInput): Promise<GameSettings | null> {
    const gameSettingsId = parseInt(id, 10);
    return this.gameSettingsService.updateGameSettings(gameSettingsId, data);
  }

  @Delete(':id')
  async deleteGameSettings(@Param('id') id: string): Promise<GameSettings | null> {
    const gameSettingsId = parseInt(id, 10);
    return this.gameSettingsService.deleteGameSettings(gameSettingsId);
  }
}
