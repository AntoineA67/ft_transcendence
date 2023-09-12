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
  async getAchievementById(@Param('id') id: number): Promise<Achievement | null> {
    return this.achievementService.getAchievementById(id);
  }

  @Get()
  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementService.getAllAchievements();
  }

  @Put(':id')
  async updateAchievement(@Param('id') id: number, @Body() data: Prisma.AchievementUpdateInput): Promise<Achievement | null> {
    return this.achievementService.updateAchievement(id, data);
  }

  @Delete(':id')
  async deleteAchievement(@Param('id') id: number): Promise<Achievement | null> {
    return this.achievementService.deleteAchievement(id);
  }
}
