import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Block, Prisma } from '@prisma/client';

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  async createBlock(data: Prisma.BlockCreateInput): Promise<Block> {
    return this.prisma.block.create({ data });
  }

  async getBlockById(id: number): Promise<Block | null> {
    return this.prisma.block.findUnique({ where: { id } });
  }

  async getAllBlocks(): Promise<Block[]> {
    return this.prisma.block.findMany();
  }

  async updateBlock(id: number, data: Prisma.BlockUpdateInput): Promise<Block | null> {
    return this.prisma.block.update({
      where: { id },
      data,
    });
  }

  async deleteBlock(id: number): Promise<Block | null> {
    return this.prisma.block.delete({ where: { id } });
  }
}
