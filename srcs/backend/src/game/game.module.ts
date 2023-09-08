import { Module } from '@nestjs/common';
import { GameController as GameController } from './game.controller';
import { GamesService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameResolver } from './game.resolver';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  providers: [GamesService, GameGateway, GameResolver, JwtService],
  controllers: [GameController],
})
export class GameModule { }
