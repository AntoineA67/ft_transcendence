import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { CustomService } from './custom.service';
import { Custom, Prisma } from '@prisma/client';

@Controller('custom')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  async createCustom(@Body() data: Prisma.CustomCreateInput): Promise<Custom> {
    return this.customService.createCustom(data);
  }

  @Get(':id')
  async getCustomById(@Param('id') id: number): Promise<Custom | null> {
    return this.customService.getCustomById(id);
  }

  @Get()
  async getAllCustoms(): Promise<Custom[]> {
    return this.customService.getAllCustoms();
  }

  @Put(':id')
  async updateCustom(@Param('id') id: number, @Body() data: Prisma.CustomUpdateInput): Promise<Custom | null> {
    return this.customService.updateCustom(id, data);
  }

  @Delete(':id')
  async deleteCustom(@Param('id') id: number): Promise<Custom | null> {
    return this.customService.deleteCustom(id);
  }
}
