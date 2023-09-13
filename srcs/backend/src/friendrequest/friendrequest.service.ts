import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { FriendRequest, Prisma } from '@prisma/client';

@Injectable()
export class FriendRequestService {
  constructor(private prisma: PrismaService) {}

  async createFriendRequest(data: Prisma.FriendRequestCreateInput): Promise<FriendRequest> {
    return this.prisma.friendRequest.create({ data });
  }

  async getFriendRequestById(id: number): Promise<FriendRequest> {
    const request = await this.prisma.friendRequest.findUnique({
      where: {
        id,
      },
    });
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }
    return request;
  }

  async getAllFriendRequests(): Promise<FriendRequest[]> {
    return this.prisma.friendRequest.findMany();
  }

  async updateFriendRequest(id: number, data: Prisma.FriendRequestUpdateInput): Promise<FriendRequest | null> {
    const existingRequest = await this.prisma.friendRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      throw new NotFoundException(`Friend request with ID ${id} not found`);
    }
    return this.prisma.friendRequest.update({
      where: { id },
      data,
    });
  }

  async deleteFriendRequest(id: number): Promise<FriendRequest | null> {
    const existingRequest = await this.prisma.friendRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      throw new NotFoundException(`Friend request with ID ${id} not found`);
    }
    return this.prisma.friendRequest.delete({ where: { id } });
  }
}
