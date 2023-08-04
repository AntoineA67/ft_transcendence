import { Injectable } from '@nestjs/common';

@Injectable()
export class GameUserLinkService {
  private gameUserLinks: any[] = [];

  create(data: any) {
    this.gameUserLinks.push(data);
    return data;
  }

  findAll() {
    return this.gameUserLinks;
  }
}
