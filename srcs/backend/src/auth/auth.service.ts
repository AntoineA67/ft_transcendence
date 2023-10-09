
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
		console.log('User  -> ', user.emails[0].value);
		let userExists: any = await this.findUserByEmail(user.emails[0].value);
		//console.log('userExists', userExists);

		if (!userExists) {
			userExists = await this.registerUser(user);
			console.log('>> id', userExists.id);
		}

		// generate and return JWT, expiresIn is in seconds
		return this.jwtService.sign({
			id: userExists.id,
		}, { expiresIn: 3600 });
	}

	async registerUser(user: any): Promise<User> {
		try {
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "nopass")
			return newUser;
		} catch {
			throw new InternalServerErrorException();
		}
	}

	async findUserByEmail(email: string) {
		const user = await this.usersService.getUserByEmail(email);

		if (!user) {
			return null;
		}

		return user;
	}
}
