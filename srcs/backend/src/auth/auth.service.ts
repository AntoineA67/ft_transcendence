
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

		const userExists = await this.findUserByLogin(user.login);
		console.log('userExists', userExists);

		if (!userExists) {
			return this.registerUser(user);
		}

		// generate and return JWT
		return this.jwtService.sign({
			sub: userExists.id,
			email: userExists.email,
			login: userExists.login,
		});
	}

	async registerUser(user: any) {
		try {
			const newUser = await this.usersService.findOrCreate(user.login);

			return this.jwtService.sign({
				sub: newUser.id,
				email: newUser.email,
				login: newUser.login,
			});
		} catch {
			throw new InternalServerErrorException();
		}
	}

	async findUserByLogin(login) {
		const user = await this.usersService.findOne(login);

		if (!user) {
			return null;
		}

		return user;
	}
}