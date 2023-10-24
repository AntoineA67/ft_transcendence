import { Server } from 'socket.io';
import Player from './Player.class';
import Ball from './Ball.class';
import { PrismaService } from 'src/prisma/prisma.service';
import { GamesService } from './game.service';
import { PlayerService } from 'src/player/player.service';

export default class Room {
	private prisma: PrismaService = new PrismaService();
	private gameService: GamesService = new GamesService(this.prisma);
	private playerService: PlayerService = new PlayerService(this.prisma);
	private players: { [id: string]: Player } = {};
	private ball: Ball | null = null;
	private interval: NodeJS.Timeout | null = null;
	private gameId: number = 0;

	constructor(private readonly roomId: string, private readonly wss: Server, public player1: any, public player2: any) {

		this.players[player1.data.user.id] = new Player(player1.data.user.id, player1.data.user.id, false);
		this.players[player2.data.user.id] = new Player(player2.data.user.id, player2.data.user.id, true);

		Object.keys(this.players).forEach((id) => {
			this.wss.to(id).emit('start', roomId);
		});
		this.startGame();
	}

	public leave(id: string) {
		if (this.players[id]) {
			delete this.players[id];
			this.wss.to(this.roomId).emit('removePlayer', id);
			if (Object.keys(this.players).length < 2) {
				this.ball = null;
			}
		}
	}

	public isEmpty(): boolean {
		return Object.keys(this.players).length === 0;
	}

	public async startGame() {
		this.ball = new Ball();
		this.wss.to(this.roomId).emit('startGame');

		// // save game in database
		// const newGame = await this.gameService.create({});
		// this.gameId = newGame.id;

		this.interval = setInterval(() => {
			this.updateGameTick();
			this.wss.to(this.roomId).emit('clients', { clients: this.players, ball: this.ball });
		}, 1000 / 60);
	}

	private updateGameTick() {
		if (!this.ball) return;
		for (const client of Object.values(this.players)) {
			client.update();
		}
		const winner = this.ball.update(this.players);
		if (winner) {
			this.endGame(Number(winner));
			// let loser;
			// this.ball = null;
			// clearInterval(this.interval!);
			// this.interval = null;
			// for (const playerId in this.players) {
			// 	if (playerId !== winner) {
			// 		loser = playerId;
			// 		break;
			// 	}
			// }
			// this.wss.to(this.roomId).emit('gameOver', { winner: this.players[winner].userId, loser: this.players[loser].userId });

			// this.gameService.update(this.gameId, { finish: true, end_date: new Date(Date.now()).toISOString(), score: `${this.players[winner].score}:${this.players[loser].score}` });
			// this.playerService.updatePlayer(this.players[winner].userId, { win: true });
			// this.playerService.updatePlayer(this.players[loser].userId, { win: false });
		}
	}

	public handleKey(client: string, data: { up: boolean, down: boolean, time: number }) {
		this.players[client].handleKeysPresses(data);
	}

	public async endGame(winner: number) {

		clearInterval(this.interval!);

		let loser;
		this.ball = null;
		this.interval = null;
		for (const playerId in this.players) {
			if (playerId !== winner.toString()) {
				loser = Number(playerId);
				break;
			}
		}
		this.wss.to(this.roomId).emit('gameOver', { winner: this.players[winner].userId, loser: this.players[loser].userId });

		const newGame = await this.gameService.create({});
		this.gameId = newGame.id;

		await this.playerService.createPlayer({ win: true, gameId: this.gameId, userId: winner });
		await this.playerService.createPlayer({ win: false, gameId: this.gameId, userId: loser });

		await this.gameService.update(this.gameId, { finish: true, end_date: new Date(Date.now()).toISOString(), score: `${this.players[winner].score}:${this.players[loser].score}` });
		const wins = await this.prisma.player.findMany({ where: { userId: winner, win: true } });
		if (wins.length == 1) {
			await this.prisma.achievement.update({ where: { userId: winner }, data: { firstWin: true } });
		} else if (wins.length == 10) {
			await this.prisma.achievement.update({ where: { userId: winner }, data: { win10Games: true } });
		} else if (wins.length == 100) {
			await this.prisma.achievement.update({ where: { userId: winner }, data: { win100Games: true } });
		}
		// this.playerService.updatePlayer(this.players[winner].userId, { win: true });
		// this.playerService.updatePlayer(this.players[loser].userId, { win: false });
	}

	// public addPlayer(player: Player) {
	// 	this.players.push(player);
	// 	this.wss.to(this.roomId).emit('players', this.players);
	// }


	// public removePlayer(playerId: string) {
	// 	this.players = this.players.filter((player) => player.id !== playerId);
	// 	this.wss.to(this.roomId).emit('players', this.players);
	// }

	// public stopGame() {
	// 	clearInterval(this.interval!);
	// 	this.interval = null;
	// 	this.ball = null;
	// 	// Object.keys(this.players).forEach((player) => {
	// 	// 	player.reset();
	// 	// });
	// 	this.wss.to(this.roomId).emit('gameState', { players: this.players, ball: this.ball });
	// }

	// private updateGameTick() {
	// 	// Update player positions
	// 	this.players.forEach((player) => {
	// 		player.updatePosition();
	// 	});

	// 	// Update ball position
	// 	if (this.ball) {
	// 		this.ball.updatePosition();
	// 		this.checkBallCollision();
	// 	}
	// }

	// private checkBallCollision() {
	// 	// Check if ball collides with any player
	// 	this.players.forEach((player) => {
	// 		if (this.ball!.collidesWith(player)) {
	// 			this.ball!.bounceOff(player);
	// 		}
	// 	});

	// 	// Check if ball collides with walls
	// 	if (this.ball!.collidesWithTopWall() || this.ball!.collidesWithBottomWall()) {
	// 		this.ball!.bounceOffWall();
	// 	}

	// 	// Check if ball goes out of bounds
	// 	if (this.ball!.goesOutOfBounds()) {
	// 		this.stopGame();
	// 	}
	// }
	// @SubscribeMessage('UpKeyPressed')
	// async handleUpKeyPressed(client: Socket, payload: string): Promise<void> {
	// 	console.log('UpKeyPressed', payload)
	// 	this.players[client.id].direction = 1
	// }
	// @SubscribeMessage('UpKeyReleased')
	// async handleUpKeyReleased(client: Socket, payload: string): Promise<void> {
	// 	console.log('UpKeyReleased', payload)
	// 	this.players[client.id].direction = 0
	// }
	// @SubscribeMessage('DownKeyPressed')
	// async handleDownKeyPressed(client: Socket, payload: string): Promise<void> {
	// 	console.log('DownKeyPressed', payload)
	// 	this.players[client.id].direction = -1
	// }
	// @SubscribeMessage('DownKeyReleased')
	// async handleDownKeyReleased(client: Socket, payload: string): Promise<void> {
	// 	console.log('DownKeyReleased', payload)
	// 	this.players[client.id].direction = 0
	// }
}