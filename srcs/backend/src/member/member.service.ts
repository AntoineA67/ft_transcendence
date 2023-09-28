import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Member, Prisma } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async createMember(data: Prisma.MemberCreateInput): Promise<Member> {
    return this.prisma.member.create({ data });
  }

  async getMemberById(id: number): Promise<Member> {
    const member = await this.prisma.member.findUnique({
      where: {
        id,
      },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async getMemberDatabyRoomId(userid: number, roomid: number): Promise<Member> {
    return await this.prisma.member.findFirst({
      where: {
        userId: userid,
        roomId: roomid,
      },
    });
  }

  async getAllMembers(): Promise<Member[]> {
    return this.prisma.member.findMany();
  }

  async updateMember(id: number, data: Prisma.MemberUpdateInput): Promise<Member | null> {
    const existingMember = await this.prisma.member.findUnique({ where: { id } });
    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async deleteMember(id: number): Promise<Member | null> {
    const existingMember = await this.prisma.member.findUnique({ where: { id } });
    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return this.prisma.member.delete({ where: { id } });
  }
}
