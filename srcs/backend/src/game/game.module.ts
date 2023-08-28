import { Module } from '@nestjs/common';
import { GameController as GameController } from './game.controller';
import { GamesService } from './game.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
// import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameResolver } from './game.resolver';
// import { GameResolver } from './game.resolver';
// import { Game } from 'src/entities/game.entity';

@Module({
  controllers: [GameController],
  providers: [GamesService, GameGateway, GameResolver],
  imports: [PrismaModule],
})
export class GameModule { }
