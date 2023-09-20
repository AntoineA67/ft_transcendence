import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Block, Prisma } from '@prisma/client';
import { UserDto } from 'src/dto/UserDto';

@Injectable()
export class BlockService {
	
	constructor(
		private readonly usersService: UsersService,
		private prisma: PrismaService
	) {}

	async getAllBlocked(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserProfile(id);
		if (!user) return ([]);
		const blocked = await this.prisma.block.findMany({
			where: { userId: {equals: id} }, 
			include: {
				blocked: { 
					select: {
						id: true,
						username: true, 
						avatar: true,
						status: true, 
					}
				}
			}
		})
		return (blocked.map((x) => (x.blocked)));
	}

	async createBlock(id: number, nick: string): Promise<Boolean> {
		const user = await this.usersService.getUserProfile(id);
		const block = await this.usersService.getUserByNick(nick);
		if (!user || !block) return (false);
		const alreadyBlock = await this.isBlocked(user.id, nick);
		if (alreadyBlock) return (true);
		try {
			await this.prisma.block.create({
				data: {
					userId: id,
					blockedId: block.id,
				}
			})
		} catch (err: any) {
			console.log('err: createBlock')
			return (false);
		}
		return (true);
	}

	async unBlock(id: number, nick: string): Promise<boolean> {
		const user = await this.usersService.getUserProfile(id);
		const block = await this.usersService.getUserByNick(nick);
		if (!user || !block) return (false);
		const alreadyBlock = await this.isBlocked(user.id, nick);
		if (!alreadyBlock) return (true);
		try {
			await this.prisma.block.deleteMany({
				where: {
					AND: [
						{userId: id}, 
						{blockedId: block.id}
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
	async isBlocked(id: number, nick: string): Promise<Boolean> {
		const user = await this.usersService.getUserProfile(id);
		const block = await this.usersService.getUserByNick(nick);
		if (!user || !block) return (false);
		let blocks = await this.getAllBlocked(id);
		blocks = blocks.filter((x) => (x.username == block.username))
		if (blocks.length == 0) return (false) 
		return (true);
	}
}
