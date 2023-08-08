import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/entities/game.entity';
import { Repository } from 'typeorm';

export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) { }

  async findAll() {
    const games = await this.gamesRepository.find();
    return games;
  }

  async find(id: number) {
    const game = await this.gamesRepository.findOne({
      where: {
        id: id,
      },
    });
    if (game) {
      return game;
    }
    throw new NotFoundException('Could not find the game');
  }

  async create(name: string) {
    const newGame = await this.gamesRepository.create({ score: name });
    await this.gamesRepository.save(newGame);
    return newGame;
  }
}
