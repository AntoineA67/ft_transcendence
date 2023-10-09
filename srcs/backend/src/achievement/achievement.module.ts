import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementGateway } from './achievement.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { PlayerService } from 'src/player/player.service';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PrismaModule],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementGateway, PlayerService], // Ajoutez la passerelle aux providers
})
export class AchievementModule {}
