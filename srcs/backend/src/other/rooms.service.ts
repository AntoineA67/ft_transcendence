import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  private rooms: any[] = [];

  create(data: any) {

    this.rooms.push(data);
    return data;
  }

  findAll() {
    return this.rooms;
  }
}
