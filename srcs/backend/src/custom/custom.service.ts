import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Custom, Prisma } from '@prisma/client';

@Injectable()
export class CustomService {
  constructor(private prisma: PrismaService) {}

  async createCustom(data: Prisma.CustomCreateInput): Promise<Custom> {
    return this.prisma.custom.create({ data });
  }

  async getCustomById(id: number): Promise<Custom> {
    const custom = await this.prisma.custom.findUnique({
      where: {
        id,
      },
    });
    if (!custom) {
      throw new NotFoundException('Custom item not found');
    }
    return custom;
  }

  async getAllCustoms(): Promise<Custom[]> {
    return this.prisma.custom.findMany();
  }

  async updateCustom(id: number, data: Prisma.CustomUpdateInput): Promise<Custom | null> {
    const existingCustom = await this.prisma.custom.findUnique({ where: { id } });
    if (!existingCustom) {
      throw new NotFoundException(`Custom item with ID ${id} not found`);
    }
    return this.prisma.custom.update({
      where: { id },
      data,
    });
  }

  async deleteCustom(id: number): Promise<Custom | null> {
    const existingCustom = await this.prisma.custom.findUnique({ where: { id } });
    if (!existingCustom) {
      throw new NotFoundException(`Custom item with ID ${id} not found`);
    }
    return this.prisma.custom.delete({ where: { id } });
  }
}
