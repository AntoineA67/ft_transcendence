import { Module } from '@nestjs/common';
import { GameUserLinkGateway } from './game-user-link.gateway';
import { GameUserLinkService } from './game-user-links.service';
import { GameUserLinkController } from './game-user-links.controller';

@Module({
  providers: [GameUserLinkGateway, GameUserLinkService],
  controllers: [GameUserLinkController],
})
export class GameUserLinkModule {}
