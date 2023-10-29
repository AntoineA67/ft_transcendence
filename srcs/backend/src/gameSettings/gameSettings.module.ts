import { Module } from '@nestjs/common';
import { GameSettingsService } from './gameSettings.service';
import { GameSettingsController } from './gameSettings.controller';
import { GameSettingsGateway } from './gameSettings.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GameSettingsService, GameSettingsGateway],
  controllers: [GameSettingsController],
})
export class GameSettingsModule { }
