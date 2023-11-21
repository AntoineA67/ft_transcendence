import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockGateway } from './block.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [BlockService, BlockGateway],
  controllers: [],
  exports: [BlockService]
})
export class BlockModule {}
