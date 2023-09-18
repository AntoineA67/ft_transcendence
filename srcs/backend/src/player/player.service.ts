import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Player, Prisma } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
    return this.prisma.player.create({ data });
  }

  async getPlayerById(id: number): Promise<Player> {
    const player = await this.prisma.player.findUnique({
      where: {
        id,
      },
    });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }

  async updatePlayer(id: number, data: Prisma.PlayerUpdateInput): Promise<Player | null> {
    const existingPlayer = await this.prisma.player.findUnique({ where: { id } });
    if (!existingPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  async deletePlayer(id: number): Promise<Player | null> {
    const existingPlayer = await this.prisma.player.findUnique({ where: { id } });
    if (!existingPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return this.prisma.player.delete({ where: { id } });
  }
}
