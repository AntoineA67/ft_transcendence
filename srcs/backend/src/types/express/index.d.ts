type requestUserDto = {
	id: number;
    email: string;
}

declare namespace Express {
	interface Request {
		user: requestUserDto;
	}
}