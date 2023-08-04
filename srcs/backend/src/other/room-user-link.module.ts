import { Module } from '@nestjs/common';
import { RoomUserLinkGateway } from './room-user-link.gateway';
import { RoomUserLinkService } from './room-user-links.service';
import { RoomUserLinkController } from './room-user-links.controller';

@Module({
  providers: [RoomUserLinkGateway, RoomUserLinkService],
  controllers: [RoomUserLinkController],
})
export class RoomUserLinkModule {}
