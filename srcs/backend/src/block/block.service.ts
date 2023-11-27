import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Block, Prisma } from '@prisma/client';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class BlockService {

	constructor(
		private readonly usersService: UsersService,
		private prisma: PrismaService
	) { }

	async getAllBlocked(id: number): Promise<UserDto[]> {
		const user = await this.usersService.getUserById(id);
		if (!user) return ([]);
		let data = await this.prisma.block.findMany({
			where: { userId: { equals: id } },
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
		const blocked = data.map((x) => (x.blocked));
		return (blocked);
	}

	async createBlock(id: number, otherId: number): Promise<Boolean> {
		const user = await this.usersService.getUserById(id);
		const block = await this.usersService.getUserById(otherId);
		if (!user || !block) return (false);
		const alreadyBlock = await this.isBlocked(user.id, otherId);
		if (alreadyBlock) return (true);
		try {
			await this.prisma.block.create({
				data: {
					userId: id,
					blockedId: otherId,
				}
			})
		} catch (err: any) {
			return (false);
		}
		return (true);
	}

	async unBlock(id: number, otherId: number): Promise<boolean> {
		const user = await this.usersService.getUserById(id);
		const block = await this.usersService.getUserById(otherId);
		if (!user || !block) return (false);
		const alreadyBlock = await this.isBlocked(user.id, otherId);
		if (!alreadyBlock) return (true);
		try {
			await this.prisma.block.deleteMany({
				where: {
					AND: [
						{ userId: id },
						{ blockedId: otherId }
					]
				}
			})
		} catch (err: any) {
			return (false);
		}
		return (true);
	}

	// whether first person block second person
	async isBlocked(id: number, otherId: number): Promise<boolean> {
		const user = await this.usersService.getUserById(id);
		const block = await this.usersService.getUserById(otherId);
		if (!user || !block) return (false);
		let blocks = await this.getAllBlocked(id);
		blocks = blocks.filter((x) => (x.username == block.username))
		if (blocks.length == 0) return (false)
		return (true);
	}
}
