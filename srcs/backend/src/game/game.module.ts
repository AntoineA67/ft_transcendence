import { Module } from '@nestjs/common';
import { GameController as GameController } from './game.controller';
import { GamesService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  providers: [GamesService, GameGateway, JwtService],
  controllers: [GameController],
})
export class GameModule { }
