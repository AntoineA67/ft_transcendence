import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesService } from 'src/message/messages.service';

@Module({
  imports: [PrismaModule],
  providers: [RoomService, RoomGateway, MessagesService],
  controllers: [RoomController],
})
export class RoomModule {}
