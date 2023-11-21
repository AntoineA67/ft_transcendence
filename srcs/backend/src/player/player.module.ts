import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PlayerService],
  controllers: [],
  exports: [PlayerService]
})
export class PlayerModule {}
