
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as randomstring from 'randomstring';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		public jwtService: JwtService
	) { }

	async login(user: any) {
		if (!user) {
			throw new BadRequestException('Unauthenticated');
		}
		let userExists: any = await this.findUserByEmail(user.emails[0].value);

		if (!userExists) {
			userExists = await this.registerUser(user);
		}
		return (userExists);
	}

	async registerUser(user: any): Promise<User> {
		try {
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "nopass")
			return newUser;
		} catch {
			try {
				const userName = user.username + "-" + randomstring.generate({
					length: 6,
					charset: 'numeric'
				});
				const newUser = await this.usersService.createUser(userName, user.emails[0].value, "nopass")
				return newUser;
			} catch {
				throw new InternalServerErrorException();
			}
		}
	}

	async findUserByEmail(email: string) {
		const user = await this.usersService.getUserByEmail(email);
		if (!user) {
			return null;
		}
		return user;
	}

	createJWT(req: any) {
		let payload = {
			id: req.user.id,
		}
		return this.jwtService.sign(payload, { expiresIn: 3600 });
	}
}
