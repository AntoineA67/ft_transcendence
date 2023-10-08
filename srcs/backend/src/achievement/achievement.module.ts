import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementGateway } from './achievement.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerService } from 'src/player/player.service';

@Module({
  imports: [PrismaModule, PlayerService],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementGateway], // Ajoutez la passerelle aux providers
})
export class AchievementModule {}
