
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { stat } from 'fs';

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

		if (!userExists) {
			userExists = await this.registerUser(user);
		}
		return (userExists);
	}

	async registerUser(user: any): Promise<User> {
		try {
			console.log('registering user', user);
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "nopass")
			return newUser;
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
