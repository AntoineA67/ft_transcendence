import Player from "./Player.class";

export default class Ball {
	[x: string]: any;
	static initialSpeed = .01;
	public speed = .01;
	public maxSpeed = .02;

	constructor(
		public x: number = .5,
		public y: number = .5,
		public velocityX: number = Math.random() > 0.5 ? Ball.initialSpeed : -Ball.initialSpeed,
		public velocityY: number = 0) { }

	update(players: { [id: string]: Player; }) {
		// console.log(players)
		const playersList = Object.values(players)
		this.x += this.velocityX;
		this.y += this.velocityY;
		if (this.y < 0) {
			this.y = 0;
			this.velocityY = -this.velocityY;
		}
		else if (this.y > 1) {
			this.y = 1;
			this.velocityY = -this.velocityY;
		}
		if (this.x < 0 || this.x > 1) {
			const playerIndex = 1 - Math.round(this.x)
			if (playersList[playerIndex].earnPoint()) {
				return playersList[playerIndex].id;
			}
			this.reset();
		}

		const player = playersList[this.x < .5 ? 0 : 1];
		if (this.collide(player)) {
			let collidePoint = this.y - player.y;
			collidePoint = collidePoint / Player.halfPaddleHeight;
			const angleRad = (Math.PI / 4) * collidePoint;
			const direction = player.invertedSide ? -1 : 1;

			this.velocityX = direction * this.speed * Math.cos(angleRad);
			this.velocityY = this.speed * Math.sin(angleRad);
			this.speed += .0005;
		}
		return null;
	}

	private collide(player: Player) {
		return (player.invertedSide ? (this.x >= player.xDistance) : (this.x <= player.xDistance)) && Math.abs(this.y - player.y) <= Player.halfPaddleHeight
	}

	private reset() {
		this.x = 0.5;
		this.y = 0.5;
		this.velocityX = Math.random() > 0.5 ? Ball.initialSpeed : -Ball.initialSpeed;
		this.velocityY = 0;
		this.speed = Ball.initialSpeed;
	}
}