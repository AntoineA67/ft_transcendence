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
  async getBlockById(@Param('id') id: number): Promise<Block | null> {
    return this.blockService.getBlockById(id);
  }

  @Get()
  async getAllBlocks(): Promise<Block[]> {
    return this.blockService.getAllBlocks();
  }

  @Put(':id')
  async updateBlock(@Param('id') id: number, @Body() data: Prisma.BlockUpdateInput): Promise<Block | null> {
    return this.blockService.updateBlock(id, data);
  }

  @Delete(':id')
  async deleteBlock(@Param('id') id: number): Promise<Block | null> {
    return this.blockService.deleteBlock(id);
  }
}
