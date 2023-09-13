import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { CustomService } from './custom.service';
import { Custom, Prisma } from '@prisma/client';

@Controller('customs')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  async createCustom(@Body() data: Prisma.CustomCreateInput): Promise<Custom> {
    return this.customService.createCustom(data);
  }

  @Get(':id')
  async getCustomById(@Param('id') id: string): Promise<Custom> {
    const customId = parseInt(id, 10);
    const custom = await this.customService.getCustomById(customId);
    return custom;
  }

  @Get()
  async getAllCustoms(): Promise<Custom[]> {
    return this.customService.getAllCustoms();
  }

  @Put(':id')
  async updateCustom(@Param('id') id: string, @Body() data: Prisma.CustomUpdateInput): Promise<Custom | null> {
    const customId = parseInt(id, 10);
    return this.customService.updateCustom(customId, data);
  }

  @Delete(':id')
  async deleteCustom(@Param('id') id: string): Promise<Custom | null> {
    const customId = parseInt(id, 10);
    return this.customService.deleteCustom(customId);
  }
}
