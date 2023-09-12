import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { MemberService } from './member.service';
import { Member, Prisma } from '@prisma/client';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async createMember(@Body() data: Prisma.MemberCreateInput): Promise<Member> {
    return this.memberService.createMember(data);
  }

  @Get(':id')
  async getMemberById(@Param('id') id: number): Promise<Member | null> {
    return this.memberService.getMemberById(id);
  }

  @Get()
  async getAllMembers(): Promise<Member[]> {
    return this.memberService.getAllMembers();
  }

  @Put(':id')
  async updateMember(@Param('id') id: number, @Body() data: Prisma.MemberUpdateInput): Promise<Member | null> {
    return this.memberService.updateMember(id, data);
  }

  @Delete(':id')
  async deleteMember(@Param('id') id: number): Promise<Member | null> {
    return this.memberService.deleteMember(id);
  }
}
