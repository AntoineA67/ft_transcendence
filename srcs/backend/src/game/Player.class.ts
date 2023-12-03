export default class Player {
	static speedFactor: number = 2;
	static distanceFromWall: number = 5;
	static halfPaddleHeight: number = 10;
	public xDistance: number;
	public score: number = 0;
	public userId: number = 0;
	public scoredThisUpdate: boolean = false;

	constructor(public id: string, userId: number, public invertedSide: boolean = false, public y: number = 50, private direction: number = 0) {
		this.xDistance = invertedSide ? 100 - Player.distanceFromWall : - 100 + Player.distanceFromWall;
		this.userId = userId;
	}

	handleKeysPresses({ up, down, time }: { up: boolean, down: boolean, time: number }) {
		if (up && !down) this.direction = 1;
		else if (down && !up) this.direction = -1;
		else this.direction = 0;
	}

	update() {
		this.scoredThisUpdate = false;
		const newY = this.y + this.direction * Player.speedFactor;
		if (newY >= Player.halfPaddleHeight && newY <= 100 - Player.halfPaddleHeight && newY !== this.y) {
			this.y = newY;
		}
	}
	earnPoint() {
		this.scoredThisUpdate = true;
		this.score++;
		return this.score >= 10;
	}
}