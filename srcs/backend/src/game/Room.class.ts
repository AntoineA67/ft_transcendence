import { Server, Socket } from 'socket.io';
import Player from './Player.class';
import Ball from './Ball.class';
import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export default class Room {
	private players: { [id: string]: Player } = {};
	private ball: Ball | null = null;
	private interval: NodeJS.Timeout | null = null;

	constructor(private readonly roomId: string, private readonly wss: Server, public firstPlayerId: string, public secondPlayerId: string) {
		this.players[firstPlayerId] = new Player(firstPlayerId, false);
		this.players[secondPlayerId] = new Player(secondPlayerId, true);

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

	public startGame() {
		this.ball = new Ball();
		this.interval = setInterval(() => {
			this.updateGameTick();
			this.wss.to(this.roomId).emit('clients', { clients: this.players, ball: this.ball });
		}, 50);
	}

	private updateGameTick() {
		if (!this.ball) return;
		for (const client of Object.values(this.players)) {
			client.update();
		}
		this.ball.update(this.players);
	}
	public handleKey(client: string, dir: number) {
		this.players[client].direction = dir;
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