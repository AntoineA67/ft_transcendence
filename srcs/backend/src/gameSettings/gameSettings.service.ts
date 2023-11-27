import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { GameSettings, Prisma } from '@prisma/client';

@Injectable()
export class GameSettingsService {
  constructor(private prisma: PrismaService) { }

  async createGameSettings(data: Prisma.GameSettingsCreateInput): Promise<GameSettings> {
    return this.prisma.gameSettings.create({ data });
  }

  async getUserGameSettings(userId: number): Promise<GameSettings> {
    const gameSettings = await this.prisma.gameSettings.findUnique({
      where: {
        userId,
      },
    });
    if (!gameSettings) {
      return this.prisma.gameSettings.create({
        data: {
          userId,
        },
      })
    }
    return gameSettings;
  }

  async getGameSettingsById(id: number): Promise<GameSettings> {
    const gameSettings = await this.prisma.gameSettings.findUnique({
      where: {
        id,
      },
    });
    if (!gameSettings) {
      throw new NotFoundException('GameSettings item not found');
    }
    return gameSettings;
  }

  async getAllGameSettingss(): Promise<GameSettings[]> {
    return this.prisma.gameSettings.findMany();
  }

  async updateGameSettings(id: number, data: Prisma.GameSettingsUpdateInput): Promise<GameSettings | null> {
    const existingGameSettings = await this.prisma.gameSettings.findUnique({ where: { id } });
    if (!existingGameSettings) {
      throw new NotFoundException(`GameSettings item with ID ${id} not found`);
    }
    return this.prisma.gameSettings.update({
      where: { id },
      data,
    });
  }

  async deleteGameSettings(id: number): Promise<GameSettings | null> {
    const existingGameSettings = await this.prisma.gameSettings.findUnique({ where: { id } });
    if (!existingGameSettings) {
      throw new NotFoundException(`GameSettings item with ID ${id} not found`);
    }
    return this.prisma.gameSettings.delete({ where: { id } });
  }

  async handleColor(userId: number, color: string): Promise<GameSettings> {
    const gameSettings = await this.prisma.gameSettings.findUnique({
      where: {
        userId,
      },
    });
    if (!gameSettings) {
      return this.prisma.gameSettings.create({
        data: {
          userId,
          paddleColor: color,
        },
      })
    }
    return this.prisma.gameSettings.update({
      where: { userId },
      data: {
        paddleColor: color,
      },
    });
  }

  async setGraphicEffects(userId: number, checked: boolean): Promise<GameSettings> {
    const gameSettings = await this.prisma.gameSettings.findUnique({
      where: {
        userId,
      },
    });
    if (!gameSettings) {
      return this.prisma.gameSettings.create({
        data: {
          userId,
          graphicEffects: checked,
        },
      })
    }
    return this.prisma.gameSettings.update({
      where: { userId },
      data: {
        graphicEffects: checked,
      },
    });
  }
}
