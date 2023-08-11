import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomUserLinkService {
  private roomUserLinks: any[] = [];

  create(data: any) {
    this.roomUserLinks.push(data);
    return data;
  }

  findAll() {
    return this.roomUserLinks;
  }
}
