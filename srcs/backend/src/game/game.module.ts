import { Module } from '@nestjs/common';
import { GameController as GameController } from './game.controller';
import { GameService } from './game.service';
import Message from '../typeorm/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GameModule { }
