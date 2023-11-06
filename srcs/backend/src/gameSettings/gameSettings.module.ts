import { Module } from '@nestjs/common';
import { GameSettingsService } from './gameSettings.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GameSettingsService],
})
export class GameSettingsModule { }
