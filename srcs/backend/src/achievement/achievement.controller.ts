import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { Achievement, Prisma } from '@prisma/client';

@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Post()
  async createAchievement(@Body() data: Prisma.AchievementCreateInput): Promise<Achievement> {
    return this.achievementService.createAchievement(data);
  }

  @Get(':id')
  async getAchievementById(@Param('id') id: string): Promise<Achievement> {
    const achievementId = parseInt(id, 10);
    const achievement = await this.achievementService.getAchievementById(achievementId);
    return achievement;
  }

  @Get()
  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementService.getAllAchievements();
  }

  @Put(':id')
  async updateAchievement(@Param('id') id: string, @Body() data: Prisma.AchievementUpdateInput): Promise<Achievement | null> {
    const achievementId = parseInt(id, 10);
    return this.achievementService.updateAchievement(achievementId, data);
  }

  @Delete(':id')
  async deleteAchievement(@Param('id') id: string): Promise<Achievement | null> {
    const achievementId = parseInt(id, 10);
    return this.achievementService.deleteAchievement(achievementId);
  }
}
