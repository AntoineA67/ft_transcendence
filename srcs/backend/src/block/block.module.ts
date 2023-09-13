import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { BlockGateway } from './block.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BlockService, BlockGateway],
  controllers: [BlockController],
})
export class BlockModule {}
