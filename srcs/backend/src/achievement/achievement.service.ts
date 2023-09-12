import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Achievement, Prisma } from '@prisma/client';

@Injectable()
export class AchievementService {
  constructor(private prisma: PrismaService) {}

  async createAchievement(data: Prisma.AchievementCreateInput): Promise<Achievement> {
    return this.prisma.achievement.create({ data });
  }

  async getAchievementById(id: number): Promise<Achievement | null> {
    return this.prisma.achievement.findUnique({ where: { id } });
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return this.prisma.achievement.findMany();
  }

  async updateAchievement(id: number, data: Prisma.AchievementUpdateInput): Promise<Achievement | null> {
    return this.prisma.achievement.update({
      where: { id },
      data,
    });
  }

  async deleteAchievement(id: number): Promise<Achievement | null> {
    return this.prisma.achievement.delete({ where: { id } });
  }
}
