import { Module } from '@nestjs/common';
import { CustomService } from './custom.service';
import { CustomController } from './custom.controller';
import { CustomGateway } from './custom.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CustomService, CustomGateway],
  controllers: [CustomController],
})
export class CustomModule {}
