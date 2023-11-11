import Player from "./Player.class";

export default class Ball {
	[x: string]: any;
	static initialSpeed = 1;
	static maxSpeed = 4;
	static ballRadius = 2;

	constructor(
		public x: number = 0,
		public y: number = 50,
		public velocityX: number = Math.random() > .5 ? Ball.initialSpeed : -Ball.initialSpeed,
		public velocityY: number = 0,
		public speed: number = Ball.initialSpeed
	) { }

	update(players: { [id: string]: Player; }) {
		const playersList = Object.values(players).sort((a, b) => a.invertedSide ? 1 : -1);
		if (playersList.length < 2) return null;
		this.x += this.velocityX;
		this.y += this.velocityY;
		if (this.y - Ball.ballRadius < 0) {
			this.y = 0 + Ball.ballRadius;
			this.velocityY = -this.velocityY;
		}
		else if (this.y + Ball.ballRadius > 100) {
			this.y = 100 - Ball.ballRadius;
			this.velocityY = -this.velocityY;
		}
		if (this.x - Ball.ballRadius <= -100 || this.x + Ball.ballRadius >= 100) {
			const playerIndex = (this.x < 0) ? 1 : 0;
			if (playersList[playerIndex].earnPoint()) {
				return playersList[playerIndex].id;
			}
			this.reset();
		}

		for (let player of playersList) {
			if (this.collide(player)) {
				let collidePoint = this.y - player.y;
				collidePoint = collidePoint / Player.halfPaddleHeight;
				const angleRad = (Math.PI / 4) * collidePoint;
				const direction = player.invertedSide ? -1 : 1;

				this.velocityX = direction * this.speed * Math.cos(angleRad);
				this.velocityY = this.speed * Math.sin(angleRad);
				if (!(this.speed + .2 >= Ball.maxSpeed)) {
					this.speed += .2
				}
			}
		}
		return null;
	}

	private collide(player: Player) {
		return (player.invertedSide ? (this.x + Ball.ballRadius >= player.xDistance) : (this.x - Ball.ballRadius <= player.xDistance)) && Math.abs(this.y - player.y) <= Player.halfPaddleHeight
	}

	private reset() {
		this.x = 0;
		this.y = 50;
		this.velocityX = Math.random() > .5 ? Ball.initialSpeed : -Ball.initialSpeed;
		this.velocityY = 0;
		this.speed = Ball.initialSpeed;
	}
}