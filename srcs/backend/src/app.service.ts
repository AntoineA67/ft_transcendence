import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }
  getHello(): string {
    return 'Hello World!';
  }
  getPrismaTest(): any {
    return this.prisma.game.findMany();
  }
}
