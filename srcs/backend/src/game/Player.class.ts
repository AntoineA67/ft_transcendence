export default class Player {
	static speedFactor: number = .01;
	static distanceFromWall: number = .02;
	static halfPaddleHeight: number = .05;
	public xDistance: number;

	constructor(public id: string, public invertedSide: boolean = false, public y: number = .5, private direction: number = 0) {
		this.xDistance = invertedSide ? 1 - Player.distanceFromWall : Player.distanceFromWall;
	}

	handleKeysPresses({ up, down, time }: { up: boolean, down: boolean, time: number }) {
		if (up && !down) this.direction = 1;
		else if (down && !up) this.direction = -1;
		else this.direction = 0;
	}

	update() {
		const newY = this.y + this.direction * Player.speedFactor;
		if (newY >= 0 && newY <= 1 && newY !== this.y) {
			this.y = newY;
		}
	}
}