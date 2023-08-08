export interface ClientUpdate {
	t: number; // timestamp
	p: { x: number; y: number; z: number }; // position
	r: { isEuleur: boolean; _x: number; _y: number; _z: number; _order: string }; // rotation
  }
  