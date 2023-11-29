import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Prisma } from '@prisma/client';
import { PlayerService } from 'src/player/player.service';
import { AchieveDto } from 'src/dto/achieve.dto';
import { devNull } from 'os';

@Injectable()
export class AchievementService {
	constructor(
		private prisma: PrismaService, 
		private playerService: PlayerService
	) {}

	// the id stands for userId, NOT the id of achievement
	async getAchieveById(id: number): Promise<AchieveDto | null> {
		try {
			if (!id || typeof id !== 'number' || id <= 0 || id > 100000)
				return null;
			const achieve = await this.prisma.achievement.findFirst({
				where: {userId: id}
			})
			if (!achieve) {
				const new_achieve = await this.prisma.achievement.create({
					data: {
						user: {connect: {id: id }}
					}
				})
				delete new_achieve.id;
				return new_achieve;
			}
			else {
				delete achieve.id;
				return achieve;
			}
		} catch (e: any) {
			const achieve = await this.prisma.achievement.findFirst({
				where: {userId: id}
			})
			if (achieve) {
				delete achieve.id;
				return achieve;
			}
			console.log('Achievement return null')
			return null
		}
	}

	// the id stands for userId, NOT the id of achievement
	async updateAchievement(id: number) {
		const allWin: number = await this.playerService.getAllWin(id);
		const allGame: number = await this.playerService.getAllGame(id);
		let achieve: any = await this.getAchieveById(id);
		(allWin >= 100) && (achieve.win100Games = true);
		(allWin >= 10) && (achieve.win10Games = true);
		(allWin >= 1) && (achieve.firstWin = true);
		(allGame >= 1000) && (achieve.play1000Games = true);
		(allGame >= 100) && (achieve.play100Games = true);
		await this.prisma.achievement.update({
			where: { userId: id }, 
			data: { ...achieve }
		})
	}

}
