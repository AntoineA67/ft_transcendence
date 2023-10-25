import { HttpStatus, Injectable, NotFoundException, ForbiddenException, UnauthorizedException, BadRequestException, InternalServerErrorException, Req, GatewayTimeoutException} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import * as randomstring from 'randomstring';
import { SigninDto } from '../dto';
import { SignupDto } from '../dto';
import { Signin42Dto } from '../dto';
import { jwtConstants } from './constants';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
// import { EphemeralKeyInfo } from 'tls';

@Injectable()
export class AuthService {
	private readonly JWT_SECRET: string | any;

	constructor(
		private usersService: UsersService,
		private prisma: PrismaService,
		public jwtService: JwtService,
		private jwt: JwtService,
    ) {
        this.JWT_SECRET = jwtConstants.secret;
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable not set!");
        }
    }


	async signup(dto: SignupDto, res: Response) {
		const existingEmail = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});
		if (existingEmail)
		{
			throw new BadRequestException('This email is already used');
		}
		const existingUsername = await this.prisma.user.findUnique({
			where: {
				username: dto.username,
			},
		});
		if (existingUsername)
		{
			throw new BadRequestException('Username taken');
		}
		try {
		const hashPassword = await argon.hash(dto.password);
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				username: dto.username,
				hashPassword,
			},
		});
		return this.signJwtTokens(user.id, user.email);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				console.log(error)
				if (error.code === 'P2002') {
					console.log("error hereeee");
				throw new ForbiddenException('Credentials taken'); // is it needed ? just error instead of credentials taken 
			}
		}
		throw error;
		}
	  }
  
	async signin(dto: SigninDto, res: Response, @Req() req) {
		// find user with email
		const user = await this.usersService.getUserByEmail(dto.email);
		// if user not found throw exception
		if (!user)
			throw new NotFoundException('User not found',);
		// compare password
		const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
		// if password wrong throw exception
		if (!passwordMatch)
			throw new ForbiddenException('Incorrect password',);
		
		return this.signJwtTokens(user.id, user.email);
	}
  
	  async validateUser(email: string): Promise <any> {
		const user = await this.usersService.getUserByEmail(email);
		if (!user)
		  throw new UnauthorizedException();      
		return user;
	  }

	  async signin42(dto: Signin42Dto, res: Response, @Req() req) {
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
				response = await this.signJwtTokens(dto.id, dto.email);
			} else {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'need token' });
			}
		// no 2fa
		} else 
			response = await this.signJwtTokens(req.user.id, req.user.email);
		// console.log(response);
		// return response;
		res.status(HttpStatus.OK).json(response);
	}

	async signJwtTokens(userId: number, userEmail: string,) {
		let payload = {
			id: userId,
			email: userEmail,
		}
		// console.log("payload==", payload);
		const secret = this.JWT_SECRET;
		const token = this.jwtService.sign(
			payload, 
			{ 
				expiresIn: '15m',
				secret: secret,
			});
		console.log("Payload=", payload)
		const refreshToken = await this.createRefreshToken(userId);
		return {
			message: 'Authentication successful',
			token: token,
			refreshToken: refreshToken
		};
	}
	
	async login42(user: any) {
		if (!user)
			throw new BadRequestException('Unauthenticated');
		let userExists: any = await this.usersService.getUserByEmail(user.emails[0].value);
		if (!userExists)
			userExists = await this.registerUser42(user);
		return (userExists);
	}

	async registerUser42(user: any): Promise<User | undefined> {
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
		if (this.isTokenValid(req))
			return res.status(200).json({ valid: true, message: "Token is valid" });
		if (!this.isRefreshTokenValid(refreshToken))
			return res.status(200).json({ valid: false, message: "Invalid token" });
		// delete refreshToken from DB to make a new one
		return this.signJwtTokens(req.user.id, req.user.email);
	}

	async isRefreshTokenValid(tokenReq: string)
	{
		if (!tokenReq)
			return false;
		const userRefreshToken = await this.prisma.refreshToken.findUnique({
			where: {
				token: tokenReq,
			},
		});
		if (userRefreshToken.expiresAt.getTime() < Date.now())
		{
			// await this.prisma.refreshToken.delete(this.refreshToken);
			return false;
		}
				// return res.status(401).json({ valid: false, message: "Invalid Token" });
		else
			return true;
				// return res.status(200).json({ valid: true, message: "Refresh token is valid" });
	}

	async isTokenValid(req: Request) {
        // Extract the token from the Authorization header
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];
        console.log("passing by isTokenValid");
        if (!token)
			return false;
            // return res.status(401).json({ valid: false, message: "Token Missing" });
        try {
            jwt.verify(token, this.JWT_SECRET);
            // return res.status(200).json({ valid: true, message: "Token is valid" });
			return true;
		} catch (error) {
            // return res.status(401).json({ valid: false, message: "Invalid Token" });
			return false;
		}
    }

	signout(req: Request, res: Response): Response {
        // Invalidate the refresh token to make the signout more secure
        // Extract the refresh token from the body or header
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is missing" });
        }
        // Remove the refresh token from the database to invalidate it
        try {
            this.prisma.refreshToken.delete({
                where: { token: refreshToken }
            });
            return res.status(200).send({ message: 'Signed out successfully' });
        } catch (error) {
            console.error(error); 
            return res.status(500).send({ message: "An error occurred" });
        }
    }
}
