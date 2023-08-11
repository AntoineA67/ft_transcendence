import Player from "./Player.class";

export default class Ball {
	[x: string]: any;
	static speed = .01
	constructor(
		public x: number = .5,
		public y: number = .5,
		public velocityX: number = Math.random() > 0.5 ? Ball.speed : -Ball.speed,
		public velocityY: number = 0) { }

	update(players: { [id: string]: Player; }) {
		// console.log(players)
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
			this.reset();
		}
		const player = Object.values(players)[this.x < .5 ? 0 : 1]
		if (this.collide(player)) {
			let collidePoint = this.y - player.y;
			collidePoint = collidePoint / Player.halfPaddleHeight;
			const angleRad = (Math.PI / 4) * collidePoint;
			const direction = player.invertedSide ? -1 : 1;

			this.velocityX = direction * .01 * Math.cos(angleRad);
			this.velocityY = .01 * Math.sin(angleRad);
		}
	}

	private collide(player: Player) {
		return (player.invertedSide ? (this.x >= player.xDistance) : (this.x <= player.xDistance)) && Math.abs(this.y - player.y) <= Player.halfPaddleHeight
	}

	private reset() {
		this.x = 0.5;
		this.y = 0.5;
		this.velocityX = Math.random() > 0.5 ? Ball.speed : -Ball.speed;
		this.velocityY = 0;
	}
}