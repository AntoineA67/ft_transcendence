import { Module } from '@nestjs/common';
import { GameController as GameController } from './game.controller';
import { GamesService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
// import { GameResolver } from './game.resolver';
import { Game } from 'src/entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GameController],
  providers: [GamesService, GameGateway],
})
export class GameModule { }
