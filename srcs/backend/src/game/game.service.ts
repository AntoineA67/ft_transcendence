import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from 'src/typeorm/game.entity';

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
    const newGame = await this.gamesRepository.create({ name: name });
    await this.gamesRepository.save(newGame);
    return newGame;
  }
}
