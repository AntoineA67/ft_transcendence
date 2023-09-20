import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Achievement, Prisma } from '@prisma/client';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  async createAchievement(data: Prisma.AchievementCreateInput): Promise<Achievement> {
    return this.prisma.achievement.create({ data });
  }

  async getAchievementById(id: number): Promise<Achievement> {
    const achievement = await this.prisma.achievement.findUnique({
      where: {
        id,
      },
    });
    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany();
  }

  async updateAchievement(id: number, data: Prisma.AchievementUpdateInput): Promise<Achievement | null> {
    const existingAchievement = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existingAchievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return this.prisma.achievement.update({
      where: { id },
      data,
    });
  }

  async deleteAchievement(id: number): Promise<Achievement | null> {
    const existingAchievement = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existingAchievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }
    return this.prisma.achievement.delete({ where: { id } });
  }
}
