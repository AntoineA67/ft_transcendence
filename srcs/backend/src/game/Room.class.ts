import { Server } from 'socket.io';
import Player from './Player.class';
import Ball from './Ball.class';
import { PrismaService } from 'src/prisma/prisma.service';
import { GamesService } from './game.service';
import { PlayerService } from 'src/player/player.service';

import { Result } from '@prisma/client';
import { AchievementService } from 'src/achievement/achievement.service';

export default class Room {
	private prisma: PrismaService = new PrismaService();
	private gameService: GamesService = new GamesService(this.prisma);
	private playerService: PlayerService = new PlayerService(this.prisma);
	private achieveService: AchievementService = new AchievementService(this.prisma, this.playerService);
	private players: { [id: string]: Player } = {};
	private ball: Ball | null = null;
	private interval: NodeJS.Timeout | null = null;
	private gameId: number = 0;
	private startTime: number = Date.now();
	private playerLeft: number = -1;

	constructor(private readonly roomId: string, private readonly wss: Server, public player1: any, public player2: any) {

		this.players[player1.data.user.id] = new Player(player1.data.user.id, player1.data.user.id, false);
		this.players[player2.data.user.id] = new Player(player2.data.user.id, player2.data.user.id, true);

		Object.keys(this.players).forEach((id) => {
			this.wss.to(id).emit('start', roomId);
		});
		this.startGame();
	}

	public async leave(id: string) {
		if (this.players[id]) {
			let winner;
			for (const playerId in this.players) {
				if (playerId != id) {
					winner = Number(playerId);
					break;
				}
			}
			this.playerLeft = winner;
		}
	}

	public isEmpty(): boolean {
		return Object.keys(this.players).length < 2;
	}

	public async startGame() {
		this.ball = new Ball();
		this.wss.to(this.roomId).emit('startGame');

		this.interval = setInterval(() => {
			this.updateGameTick();
			this.wss.to(this.roomId).emit('clients', { clients: this.players, ball: this.ball, time: 3 * 1000 * 60 - (Date.now() - this.startTime) });
		}, 1000 / 60);
	}

	private updateGameTick() {
		if (!this.ball) return;
		if (this.playerLeft !== -1) {
			this.endGame(Number(this.playerLeft));
			return;
		}
		for (const client of Object.values(this.players)) {
			client.update();
		}
		const winner = this.ball.update(this.players);
		if (winner) {
			this.endGame(Number(winner));
		} else if (Date.now() - this.startTime > 3 * 1000 * 60) { // 3 * 60 * 1000
			const players = Object.values(this.players);
			if (players[0] && players[1]) {
				if (players[0].score > players[1].score) {
					this.endGame(Number(players[0].id));
				} else if (players[0].score < players[1].score) {
					this.endGame(Number(players[1].id));
				} else {
					this.endGame(-1); // -1 means nobody won
				}
			} else {
				this.endGame(-1);
			}
		}
	}

	public handleKey(client: string, data: { up: boolean, down: boolean, time: number }) {
		this.players[client].handleKeysPresses(data);
	}

	public async endGame(winner: number) {

		clearInterval(this.interval!);

		if (winner == -1) {
			this.wss.to(this.roomId).emit('gameOver', { winner: null, loser: null });
			const newGame = await this.gameService.create({});
			this.gameId = newGame.id;
			const players = Object.values(this.players);
			await this.gameService.update(this.gameId, { finish: true, end_date: new Date(Date.now()).toISOString(), score: `${players[0].score}:${players[1].score}` });
			await this.playerService.createPlayer({ win: Result.DRAW, gameId: this.gameId, userId: players[0].id });
			await this.playerService.createPlayer({ win: Result.DRAW, gameId: this.gameId, userId: players[1].id });
			return;
		}

		let loser;
		this.ball = null;
		this.interval = null;
		for (const playerId in this.players) {
			if (playerId !== winner.toString()) {
				loser = Number(playerId);
				break;
			}
		}
		const loserPlayer = this.players[loser];
		const winnerPlayer = this.players[winner];
		const winnerUser = await this.prisma.user.findUnique({ where: { id: winner }, select: { username: true, avatar: true, } });
		const loserUser = await this.prisma.user.findUnique({ where: { id: loser }, select: { username: true, avatar: true, } });
		await this.prisma.user.update({ where: { id: winner }, data: { status: 'ONLINE' } });
		await this.prisma.user.update({ where: { id: loser }, data: { status: 'ONLINE' } });
		this.wss.to(this.roomId).emit('gameOver', { winner: { ...winnerUser, score: winnerPlayer.score }, loser: { ...loserUser, score: loserPlayer.score } });

		const newGame = await this.gameService.create({});
		this.gameId = newGame.id;

		if (!winnerPlayer || !loserPlayer) {
			return;
		}

		await this.playerService.createPlayer({ win: Result.WIN, gameId: this.gameId, userId: winner });
		await this.playerService.createPlayer({ win: Result.LOSE, gameId: this.gameId, userId: loser });

		await this.gameService.update(this.gameId, { finish: true, end_date: new Date(Date.now()).toISOString(), score: `${winnerPlayer.score}:${loserPlayer.score}` });
		await this.achieveService.updateAchievement(winner)
		await this.achieveService.updateAchievement(loser)
	}
}