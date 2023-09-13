import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Block, Prisma } from '@prisma/client';

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  async createBlock(data: Prisma.BlockCreateInput): Promise<Block> {
    return this.prisma.block.create({ data });
  }

  async getBlockById(id: number): Promise<Block> {
    const block = await this.prisma.block.findUnique({
      where: {
        id,
      },
    });
    if (!block) {
      throw new NotFoundException('Block not found');
    }
    return block;
  }

  async getAllBlocks(): Promise<Block[]> {
    return this.prisma.block.findMany();
  }

  async updateBlock(id: number, data: Prisma.BlockUpdateInput): Promise<Block | null> {
    const existingBlock = await this.prisma.block.findUnique({ where: { id } });
    if (!existingBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return this.prisma.block.update({
      where: { id },
      data,
    });
  }

  async deleteBlock(id: number): Promise<Block | null> {
    const existingBlock = await this.prisma.block.findUnique({ where: { id } });
    if (!existingBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return this.prisma.block.delete({ where: { id } });
  }
}
