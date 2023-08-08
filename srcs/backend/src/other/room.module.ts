import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomService } from './rooms.service';
import { RoomController } from './rooms.controller';

@Module({
  providers: [RoomGateway, RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
