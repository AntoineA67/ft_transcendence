import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Player, Prisma } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
    return this.prisma.player.create({ data });
  }

  async getPlayerById(id: number): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { id } });
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }

  async updatePlayer(id: number, data: Prisma.PlayerUpdateInput): Promise<Player | null> {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  async deletePlayer(id: number): Promise<Player | null> {
    return this.prisma.player.delete({ where: { id } });
  }
}
