import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PlayerService } from 'src/player/player.service';
import { AchieveDto } from 'src/dto/achieve.dto';

@Injectable()
export class AchievementService {
	constructor(
		private prisma: PrismaService, 
		private playerService: PlayerService
	) {}

	async getAchieveById(id: number): Promise<AchieveDto> {
		const achieve = await this.prisma.achievement.upsert({
			where: { userId: id },
			create: { user: {connect: {id} }}, 
			update: {}
		});
		delete achieve.id;
		delete achieve.userId;
		return {userId: id,  ...achieve};
	}
	
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
