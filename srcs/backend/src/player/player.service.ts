import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assurez-vous d'utiliser le chemin correct
import { Player, Prisma } from '@prisma/client';
import { HistoryDto } from 'src/dto/history.dto';

import { Result } from '@prisma/client';

@Injectable()
export class PlayerService {
	constructor(private prisma: PrismaService) { }

	private logger = new Logger('player');

	async getHistory(id: number): Promise<HistoryDto[]> {
		let history: any = await this.prisma.player.findMany({
			where: { userId: id },
			include: {
				game: {
					include: {
						players: {
							include: {
								user: { select: { username: true } }
							}
						}
					}
				}
			},
		});
		history = history.filter((x) => (x.game.finish));
		history = history.map((x) => ({
			playerId: x.id,
			date: x.game.end_date,
			win: x.win,
			against: (x.game.players[0].userId == id
			) ? (x.game.players[1].user.username
			) : (x.game.players[0].user.username),
			score: x.game.score
		}))
		return (history);
	}

	async getAllWin(id: number): Promise<number> {
		let history = await this.prisma.player.findMany({
			where: {
				userId: { equals: id },
				win: { equals: Result.WIN }
			}
		})
		return (history.length);
	}

	async getAllGame(id: number): Promise<number> {
		let history = await this.prisma.player.findMany({
			where: {
				userId: { equals: id },
			}
		})
		return (history.length);
	}

	async createPlayer(data: any): Promise<Player> {
		return this.prisma.player.create({ data });
	}

	async updatePlayer(id: number, data: any): Promise<Player | null> {
		if (await this.prisma.player.findUnique({ where: { id } })) {
			return this.prisma.player.update({
				where: { id },
				data,
			});
		}
	}
}
