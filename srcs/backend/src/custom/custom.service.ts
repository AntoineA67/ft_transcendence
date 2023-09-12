import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Custom, Prisma } from '@prisma/client';

@Injectable()
export class CustomService {
  constructor(private prisma: PrismaService) {}

  async createCustom(data: Prisma.CustomCreateInput): Promise<Custom> {
    return this.prisma.custom.create({ data });
  }

  async getCustomById(id: number): Promise<Custom | null> {
    return this.prisma.custom.findUnique({ where: { id } });
  }

  async getAllCustoms(): Promise<Custom[]> {
    return this.prisma.custom.findMany();
  }

  async updateCustom(id: number, data: Prisma.CustomUpdateInput): Promise<Custom | null> {
    return this.prisma.custom.update({
      where: { id },
      data,
    });
  }

  async deleteCustom(id: number): Promise<Custom | null> {
    return this.prisma.custom.delete({ where: { id } });
  }
}
