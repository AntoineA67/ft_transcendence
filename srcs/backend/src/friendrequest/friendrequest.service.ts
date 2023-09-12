import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequest, Prisma } from '@prisma/client';

@Injectable()
export class FriendRequestService {
  constructor(private prisma: PrismaService) {}

  async createFriendRequest(data: Prisma.FriendRequestCreateInput): Promise<FriendRequest> {
    return this.prisma.friendRequest.create({ data });
  }

  async getFriendRequestById(id: number): Promise<FriendRequest | null> {
    return this.prisma.friendRequest.findUnique({ where: { id } });
  }

  async getAllFriendRequests(): Promise<FriendRequest[]> {
    return this.prisma.friendRequest.findMany();
  }

  async updateFriendRequest(id: number, data: Prisma.FriendRequestUpdateInput): Promise<FriendRequest | null> {
    return this.prisma.friendRequest.update({
      where: { id },
      data,
    });
  }

  async deleteFriendRequest(id: number): Promise<FriendRequest | null> {
    return this.prisma.friendRequest.delete({ where: { id } });
  }
}
