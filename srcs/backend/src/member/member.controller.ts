import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { MemberService } from './member.service';
import { Member, Prisma } from '@prisma/client';

@Controller('api/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async createMember(@Body() data: Prisma.MemberCreateInput): Promise<Member> {
    return this.memberService.createMember(data);
  }

  @Get()
  async getAllMembers(): Promise<Member[]> {
    return this.memberService.getAllMembers();
  }

  @Put(':id')
  async updateMember(@Param('id') id: string, @Body() data: Prisma.MemberUpdateInput): Promise<Member | null> {
    const memberId = parseInt(id, 10);
    return this.memberService.updateMember(memberId, data);
  }

  @Delete(':id')
  async deleteMember(@Param('id') id: string): Promise<Member | null> {
    const memberId = parseInt(id, 10);
    return this.memberService.deleteMember(memberId);
  }
}
