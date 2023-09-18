
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		public jwtService: JwtService
	) { }

	// async validateUser(username: string, pass: string): Promise<any> {
	// 	const user = await this.usersService.findOne(username);
	// 	if (user && user.password === pass) {
	// 		const { password, ...result } = user;
	// 		return result;
	// 	}
	// 	return null;
	// }


	async login(user: any) {
		if (!user) {
			throw new BadRequestException('Unauthenticated');
		}

		let userExists: any = await this.findUserByLogin(user.username);
		console.log('userExists', userExists);

		if (!userExists) {
			userExists = await this.registerUser(user);
		}

		// generate and return JWT, expiresIn is in seconds
		return this.jwtService.sign({
			sub: userExists.username,
			email: userExists.email,
			login: userExists.username,
		}, { expiresIn: 3600 });
	}

	// select * from "user";
	// DELETE FROM "user" WHERE id = 1;
	async registerUser(user: any): Promise<User> {
		try {
			console.log('registering user', user);
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "changeme")
			return newUser;
			// .then((res) => {
			// return this.jwtService.sign({
			// 	sub: res.username,
			// 	email: res.email,
			// 	login: res.username,
			// });
			// });

			// return this.jwtService.sign({
			// 	sub: newUser.username,
			// 	email: newUser.email,
			// 	login: newUser.username,
			// });
		} catch {
			throw new InternalServerErrorException();
		}
	}

	async findUserByLogin(username: string) {
		const user = await this.usersService.getUserByUsername(username);

		if (!user) {
			return null;
		}

		return user;
	}
}
