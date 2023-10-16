import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Member, Prisma } from '@prisma/client';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class MemberService {
	constructor(
		private prisma: PrismaService,
		private roomService: RoomService,
		) { }

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

	async getMemberDatabyRoomId(userid: number, roomid: number): Promise<any | null> {
		const room = await this.prisma.room.findUnique({
		  where: {
			id: roomid,
		  },
		});
	  
		if (!room) {
		  return null;
		}
	  
		let pvroom: any | undefined;
	  
		if (!room.isChannel) {
		  pvroom = await this.roomService.getPrivateRoomById(userid, roomid);
		}
	  
		const member = await this.prisma.member.findFirst({
		  where: {
			userId: userid,
			roomId: roomid,
		  },
		  include: {
			user: true,
		  },
		});
	  
		if (!member) {
		  return null;
		}
	  
		const memberstatus = {
		  id: member.id,
		  userId: member.userId,
		  username: member.user.username,
		  roomId: member.roomId,
		  owner: member.owner,
		  admin: member.admin,
		  ban: room.isChannel ? member.ban : pvroom?.block || pvroom?.blocked,
		  mute: member.mute,
		};
	  
		return memberstatus;
	  }
	  
	  

	async getMembersByRoomId(roomid: number): Promise<any[]> {
		const members = await this.prisma.member.findMany({
			where: {
				roomId: roomid,
			},
		});
		if (!members) {
			return null;
		}
		const membersList = [];
		for (const member of members) {
			const memberStatus = await this.getMemberDatabyRoomId(member.userId, roomid);
			if (memberStatus) {
				membersList.push(memberStatus);
			}
		  }
		Logger.log(membersList);
		return membersList;
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
