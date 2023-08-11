import { Module } from '@nestjs/common';
import { CustomGateway } from './custom.gateway';
import { CustomService } from './customs.service';
import { CustomController } from './customs.controller';

@Module({
  providers: [CustomGateway, CustomService],
  controllers: [CustomController],
})
export class CustomModule {}
