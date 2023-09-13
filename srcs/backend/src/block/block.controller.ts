import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { BlockService } from './block.service';
import { Block, Prisma } from '@prisma/client';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  async createBlock(@Body() data: Prisma.BlockCreateInput): Promise<Block> {
    return this.blockService.createBlock(data);
  }

  @Get(':id')
  async getBlockById(@Param('id') id: string): Promise<Block> {
    const blockId = parseInt(id, 10);
    const block = await this.blockService.getBlockById(blockId);
    return block;
  }

  @Get()
  async getAllBlocks(): Promise<Block[]> {
    return this.blockService.getAllBlocks();
  }

  @Put(':id')
  async updateBlock(@Param('id') id: string, @Body() data: Prisma.BlockUpdateInput): Promise<Block | null> {
    const blockId = parseInt(id, 10);
    return this.blockService.updateBlock(blockId, data);
  }

  @Delete(':id')
  async deleteBlock(@Param('id') id: string): Promise<Block | null> {
    const blockId = parseInt(id, 10);
    return this.blockService.deleteBlock(blockId);
  }
}
