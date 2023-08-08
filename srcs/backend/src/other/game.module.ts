import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './games.service';
import { GameController } from './games.controller';

@Module({
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
