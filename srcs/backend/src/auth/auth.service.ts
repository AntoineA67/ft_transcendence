
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
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

		const userExists = await this.findUserByLogin(user.username);
		console.log('userExists', userExists);

		if (!userExists) {
			return this.registerUser(user);
		}

		// generate and return JWT
		return this.jwtService.sign({
			sub: userExists.username,
			email: userExists.email_address,
			login: userExists.username,
		});
	}

	// select * from "user";
	// DELETE FROM "user" WHERE user_id = 1;
	async registerUser(user: any) {
		try {
			console.log('registering user', user);
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "changeme")
			// .then((res) => {
			// return this.jwtService.sign({
			// 	sub: res.username,
			// 	email: res.email_address,
			// 	login: res.username,
			// });
			// });

			return this.jwtService.sign({
				sub: newUser.username,
				email: newUser.email_address,
				login: newUser.username,
			});
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