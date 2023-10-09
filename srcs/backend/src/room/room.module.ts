import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesService } from 'src/message/messages.service';
import { UsersModule } from 'src/users/users.module';
import { BlockService } from 'src/block/block.service';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [RoomService, RoomGateway, MessagesService, BlockService],
  controllers: [RoomController],
})
export class RoomModule {}
