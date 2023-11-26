import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerService } from 'src/player/player.service';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PrismaModule, PlayerModule],
  controllers: [],
  providers: [AchievementService],
  exports: [AchievementService]
})
export class AchievementModule {}
