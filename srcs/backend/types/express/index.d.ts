type requestUserDto = {
	id: number;
}

declare namespace Express {
	interface Request {
		user: requestUserDto;
	}
}