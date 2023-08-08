// import { NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Game } from 'src/entities/game.entity';
// import { Repository } from 'typeorm';
import { game, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<any> {
    // const prisma = new PrismaClient()
    const games = await this.prisma.game.findMany()
    console.log("oui", games)
    return games;
    // return await this.prisma.game.findMany();
  }

  // async find(
  //   gameWhereUniqueInput: Prisma.gameWhereUniqueInput,
  // ): Promise<game | null> {
  //   return this.prisma.game.findUnique({
  //     where: gameWhereUniqueInput,
  //   });
  // }

  async create(data: Prisma.gameCreateInput): Promise<game> {
    // console.log("oui", this.prisma)
    return await this.prisma.game.create({
      data: {
        start_date: new Date(Date.now()).toISOString(),
      }

    });
  }
}
