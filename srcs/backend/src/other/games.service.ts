import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private games: any[] = [];

  create(data: any) {
    this.games.push(data);
    return data;
  }

  findAll() {
    return this.games;
  }
}
