import {
	HttpStatus,
	Injectable,
	NotFoundException,
	ForbiddenException,
	UnauthorizedException,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import * as randomstring from 'randomstring';
import { SigninDto, SignupDto, Intra42Dto } from '../dto';
import { jwtConstants } from './constants';
import { randomBytes } from 'crypto';
import { first } from 'rxjs';

@Injectable()
export class AuthService {
	private readonly JWT_SECRET: string | any;

	constructor(
		private usersService: UsersService,
		private prisma: PrismaService,
		public jwtService: JwtService,
	) {
		this.JWT_SECRET = jwtConstants.secret;
		if (!this.JWT_SECRET) {
			throw new Error("JWT_SECRET environment variable not set!");
		}
	}

	async signup(dto: SignupDto) {
		try {
			if (dto.email.includes('@student.42') || dto.email.includes('@42'))
				throw new BadRequestException('Please sign in in with 42 if you are a 42 student');
			if (await this.usersService.getUserByEmail(dto.email))
				throw new BadRequestException('This email is already used');
			if (await this.usersService.getUserByNick(dto.username))
				throw new BadRequestException('Username taken');
			const hashPassword = await argon.hash(dto.password);
			if (!hashPassword)
				throw new BadRequestException('Bad request');
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					username: dto.username,
					hashPassword,
					firstConnexion: "true",
				},
			});
			const achieve = await this.prisma.achievement.create({
				data: {
					userId: user.id,
				}
			});
			if (!user)
				throw new BadRequestException('Bad request');
			return this.signJwtTokens(user.id, user.email, user.firstConnexion);
		} catch (error) {
			throw error;
		}
	}

	async signin(dto: SigninDto) {
		// find user with email
		try {
			if (!dto || Object.keys(dto).length === 0) {
				throw new BadRequestException('Bad request');
			}
			if (typeof dto.email !== 'string' || dto.email.length > 50) {
				throw new BadRequestException('Bad request for entry email');
			}
			if (typeof dto.password !== 'string' || dto.password.length > 50) {
				throw new BadRequestException('Bad request for entry email');
			}
			if (dto.email.includes('@student.42') || dto.email.includes('@42'))
				throw new BadRequestException('Please sign in in with 42 if you are a 42 student');
			const user = await this.usersService.getUserByEmail(dto.email);
			// if user not found throw exception
			if (!user)
				throw new NotFoundException('User not found',);
			// compare password
			// if password wrong throw exception
			const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
			if (!passwordMatch)
				throw new ForbiddenException('Incorrect password',);

			if (!dto.token2FA && user.activated2FA) {
				return {
					_2fa: true
				};
			}
			// if 2fa is activated and user have sent token
			if (dto.token2FA && user.activated2FA) {
				const _2FAValid = await this.usersService.verify2FA(user, dto.token2FA);

				if (!_2FAValid) {
					// If 2FA token is invalid, throw an exception
					throw new UnauthorizedException('2FA token invalid or required');
				}
			}
			const data = { firstConnexion: "false" };
			await this.usersService.updateUser(user.id, data)
			return await this.signJwtTokens(user.id, user.email, "false");
		}
		catch (error) {
			throw error;
		}
	}

	async validateUser(email: string): Promise<any> {
		const user = await this.usersService.getUserByEmail(email);
		if (!user)
			throw new UnauthorizedException();
		return user;
	}

	async signin42(dto: Intra42Dto, res: Response, @Req() req) {
		// if 2fa is activated and user have not sent token
		let response;
		if (!dto.token2FA && dto.activated2FA) {
			response = {
				id: dto.id,
				_2fa: true
			};
			// if 2fa is activated and user have sent token
		} else if (dto.token2FA && dto.activated2FA) {
			const _2FAValid = await this.usersService.verify2FA(dto.user, dto.token2FA);
			if (_2FAValid) {
				response = await this.signJwtTokens(dto.id, dto.email, "false");
			} else {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'need token' });
			}
			// no 2fa
		} else
			response = await this.signJwtTokens(dto.id, dto.email, dto.firstConnexion);
		const data = { firstConnexion: "false" };
		await this.usersService.updateUser(dto.id, data);

		res.status(HttpStatus.OK).json(response);
	}

	async signJwtTokens(userId: number, userEmail: string, firstConnexion: string) {
		let payload = {
			id: userId,
			email: userEmail,
			firstConnexion: firstConnexion
		}
		const secret = this.JWT_SECRET;
		const token = this.jwtService.sign(
			payload,
			{
				expiresIn: '15m',
				secret: secret,
			});
		const refreshToken = await this.createRefreshToken(userId);
		return {
			message: 'Authentication successful',
			token: token,
			refreshToken: refreshToken,
			firstConnexion: firstConnexion,
		};
	}

	async login42(user: any): Promise<User> {
		if (!user || !user.emails || !user.emails.length || !user.emails[0].value) {
			throw new BadRequestException('Invalid user data');
		}
		const email = user.emails[0].value;
		let userExists: any = await this.usersService.getUserByEmail(email);
		if (!userExists) {
			userExists = await this.registerUser42(user);
			const data = { firstConnexion: "true" };
			await this.usersService.updateUser(userExists.id, data)
		}
		else {
			const data = { firstConnexion: "false" };
			await this.usersService.updateUser(userExists.id, data)
		}
		return (userExists);
	}

	async registerUser42(user: any): Promise<User> {
		if (!user || !user.username || !user.emails || !user.emails.length || !user.emails[0].value) {
			throw new BadRequestException('Invalid user data for registration');
		}
		const email = user.emails[0].value;
		try {
			const newUser = await this.usersService.createUser(user.username, user.emails[0].value, "nopass", user._json.image.link)
			return newUser;
		} catch {
			try {
				const userName = user.username + "-" + randomstring.generate({
					length: 6,
					charset: 'numeric'
				});
				const newUser = await this.usersService.createUser(userName, email, "nopass", user._json.image.link)
				return newUser;
			} catch {
				return;
			}
		}
	}

	async createRefreshToken(userId: number): Promise<string> {
		const refreshToken = randomBytes(40).toString('hex'); // Generates a random 40-character hex string
		const expiration = new Date();
		expiration.setDate(expiration.getDate() + 7); // Set refreshToken expiration date within 7 days
		await this.prisma.refreshToken.create({
			data: {
				token: refreshToken,
				userId: userId,
				expiresAt: expiration
			}
		});
		return refreshToken;
	}

	async refreshToken(refreshToken: string, req: Request, res: Response) {
		try {
			if (!refreshToken) {
				throw new UnauthorizedException("Empty refresh token");
			}

			const userRefreshToken = await this.prisma.refreshToken.findUnique({
				where: { token: refreshToken },
			});

			if (!userRefreshToken || !this.isRefreshTokenValid(refreshToken)) {
				await this.deleteRefreshTokenForUser(userRefreshToken?.userId);
				throw new UnauthorizedException("Invalid refresh token");
			}

			const user = await this.prisma.user.findUnique({
				where: {
					id: userRefreshToken.userId,
				}
			});
			if (!user)
				throw new UnauthorizedException("Invalid refresh token");

			return await this.signJwtTokens(user.id, user.email, user.firstConnexion);
		}
		catch (err) {
			throw new UnauthorizedException("Invalid refresh token");
		}
	}


	async isRefreshTokenValid(tokenReq: string) {
		if (!tokenReq)
			return false;
		const userRefreshToken = await this.prisma.refreshToken.findUnique({
			where: {
				token: tokenReq,
			},
		});
		if (!userRefreshToken)
			return false;
		if (userRefreshToken.expiresAt.getTime() < Date.now())
			return false;
		else
			return true;
	}

	async signout(refreshToken: string): Promise<{ message: string }> { // Invalidate the refresh token to make the signout more secure
		try {
			if (!refreshToken) {
				throw new UnauthorizedException("Refresh token is missing");
			}

			const userRefreshToken = await this.prisma.refreshToken.findUnique({
				where: { token: refreshToken },
			});

			if (!userRefreshToken) {
				throw new UnauthorizedException("Invalid refresh token");
			}

			await this.deleteRefreshTokenForUser(userRefreshToken.userId);
			return { message: 'Signed out successfully' };
		}
		catch (error) {
			console.error('Error signing out:', error);
		}
	}

	async deleteRefreshTokenForUser(userId: number): Promise<void> {
		try {
			await this.prisma.refreshToken.deleteMany({
				where: {
					userId: userId,
				},
			});
		} catch (error) {
			console.error('Error deleting refresh token:', error);
			return;
		}
	}
}