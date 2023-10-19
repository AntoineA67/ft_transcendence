import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementGateway } from './achievement.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerService } from 'src/player/player.service';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PrismaModule, PlayerModule],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementGateway], // Ajoutez la passerelle aux providers
  exports: [AchievementService]
})
export class AchievementModule {}
