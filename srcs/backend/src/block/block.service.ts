import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Block, Prisma } from '@prisma/client';

@Injectable()
export class BlockService {
	
	constructor(
		private readonly usersService: UsersService,
		private prisma: PrismaService
	) {}

	async getAllBlocked(myNick: string): Promise<string[]> {
		const myId = await this.usersService.getIdByNick(myNick);
		if (!myId) return ([]);
		const blocked = await this.prisma.block.findMany({
			where: { userId: {equals: myId} }, 
			include: {
				blocked: { select: {username: true} }
			}
		})
		return (blocked.map((x) => (x.blocked.username)));
	}

	async createBlock(myNick: string, nick: string): Promise<Boolean> {
		const myId = await this.usersService.getIdByNick(myNick);
		const id = await this.usersService.getIdByNick(nick);
		if (!myId || !id) return (false);
		const alreadyBlock = await this.isBlocked(myNick, nick);
		if (alreadyBlock) return (true);
		try {
			await this.prisma.block.create({
				data: {
					userId: myId,
					blockedId: id,
				}
			})
		} catch (err: any) {
			console.log('err: createBlock')
			return (false);
		}
		return (true);
	}

	async unBlock(myNick: string, nick: string) {
		const myId = await this.usersService.getIdByNick(myNick);
		const id = await this.usersService.getIdByNick(nick);
		if (!myId || !id) return (false);
		const alreadyBlock = await this.isBlocked(myNick, nick);
		if (!alreadyBlock) return (true);
		try {
			await this.prisma.block.deleteMany({
				where: {
					AND: [
						{userId: myId}, 
						{blockedId: id}
					]
				}
			})
		} catch (err: any) {
			console.log('err: unBlock')
			return (false);
		}
		return (true);
	}

	// whether first person block second person
	async isBlocked(myNick: string, blocked: string): Promise<Boolean> {
		const myId = await this.usersService.getIdByNick(myNick);
		const blockId = await this.usersService.getIdByNick(blocked);
		if (!myId || ! blockId) return (false)
		let blocks = await this.getAllBlocked(myNick);
		blocks = blocks.filter((nick) => (nick == blocked))
		if (blocks.length == 0) return (false) 
		return (true);
	}
}
