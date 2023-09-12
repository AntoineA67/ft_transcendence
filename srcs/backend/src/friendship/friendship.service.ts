import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Friendship, Prisma } from '@prisma/client';

@Injectable()
export class FriendshipService {
  constructor(private prisma: PrismaService) {}

  async createFriendship(data: Prisma.FriendshipCreateInput): Promise<Friendship> {
    return this.prisma.friendship.create({ data });
  }

  async getFriendshipById(id: number): Promise<Friendship | null> {
    return this.prisma.friendship.findUnique({ where: { id } });
  }

  async getAllFriendships(): Promise<Friendship[]> {
    return this.prisma.friendship.findMany();
  }

  async updateFriendship(id: number, data: Prisma.FriendshipUpdateInput): Promise<Friendship | null> {
    return this.prisma.friendship.update({
      where: { id },
      data,
    });
  }

  async deleteFriendship(id: number): Promise<Friendship | null> {
    return this.prisma.friendship.delete({ where: { id } });
  }
}
