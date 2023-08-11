import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomService {
  private customs: any[] = [];

  create(data: any) {
    this.customs.push(data);
    return data;
  }

  findAll() {
    return this.customs;
  }
}
