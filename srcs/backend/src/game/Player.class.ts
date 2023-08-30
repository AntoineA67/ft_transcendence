export default class Player {
	static speedFactor: number = .01;
	static distanceFromWall: number = .02;
	static halfPaddleHeight: number = .05;
	public xDistance: number;

	constructor(public id: string, public invertedSide: boolean = false, public y: number = .5, public direction: number = 0) {
		this.xDistance = invertedSide ? 1 - Player.distanceFromWall : Player.distanceFromWall;
	}

	update() {
		if (this.direction !== 0) {
			this.y += this.direction * Player.speedFactor;
			if (this.y < 0) {
				this.y = 0;
			}
			else if (this.y > 1) {
				this.y = 1;
			}
		}
	}
}