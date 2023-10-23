import { HttpStatus, Injectable, NotFoundException, ForbiddenException, UnauthorizedException, BadRequestException, InternalServerErrorException, Req} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import * as randomstring from 'randomstring';
import { SigninDto } from '../dto';
import { SignupDto } from '../dto';
import { jwtConstants } from './constants';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

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
		//verify if user exists
		const hashPassword = await argon.hash(dto.password);
		try {
			// const existingUser = await this.prisma.user.findUnique({
			// 	where: {
			// 		username: dto.username,
			// 	},
			// });
			// if (existingUser)
			// {
				// 	return new BadRequestException('Username alredy taken');
				// }
				const user = await this.prisma.user.create({
					data: {
						email: dto.email,
						username: dto.username,
						hashPassword,
					},
				});
				return this.signToken(user.id, res);
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					console.log(error)
					if (error.code === 'P2002') {
						console.log("error hereeee");
					throw new ForbiddenException('Credentials taken');
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
		if (req.query._2fa && req.user.activated2FA)
		{
			const _2faValid = await this.usersService.verify2FA(req.user, req.query._2fa);
			if (_2faValid) {
				return this.signToken(user.id, res);
				// response = await this.authService.signToken(req.user.id, res);
			} else {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'need token' });
			}
			// no 2fa
		} 
		// send the token
		return this.signToken(user.id, res);
	}
  
	  async validateUser(email: string): Promise <any> {
		const user = await this.usersService.getUserByEmail(email);
		if (!user)
		  throw new UnauthorizedException();      
		return user;
	  }
  
	  async signToken(
		  userId: number,
		  res: Response
	  	): Promise<void> {
		  const payload = {
			  id: userId,
		  };
		  const secret = this.JWT_SECRET;
		  const token = await this.jwt.signAsync(
			  payload,
			  {
				  expiresIn: '15m',
				  secret: secret,
			  },
		  );
  
		const refreshToken = await this.createRefreshToken(userId);
		console.log('refresh token = ');
		console.log(refreshToken);
		console.log('token = ');
		console.log(token);

		// Return the tokens in the response body
		res.status(200).send({
			message: 'Authentication successful',
			token: token,
			refreshToken: refreshToken
		});
	  }

	async createJWT(req: any) {
		let payload = {
			id: req.user.id,
			email: req.user.email,
		}
		const secret = this.JWT_SECRET;
		// return this.jwtService.sign(
		const token = this.jwtService.sign(
			payload, 
			{ 
				expiresIn: '15m',
				secret: secret,
			});
		const refreshToken = await this.createRefreshToken(req.user.id);
		return {
			message: 'Authentication successful',
			token: token,
			refreshToken: refreshToken
		};
	}
	
	async login(user: any) {
		if (!user) {
			throw new BadRequestException('Unauthenticated');
		}
		let userExists: any = await this.usersService.getUserByEmail(user.emails[0].value);

		if (!userExists) {
			userExists = await this.registerUser(user);
		}
		return (userExists);
	}

	async registerUser(user: any): Promise<User | undefined> {
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

	async checkTokenValidity(req: Request, res: Response) {
        // Extract the token from the Authorization header
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];

        console.log("passing by checktokenvalidity");
        if (!token)
            return res.status(401).json({ valid: false, message: "Token Missing" });

        try {
            jwt.verify(token, this.JWT_SECRET);
            return res.status(200).json({ valid: true, message: "Token is valid" });
        } catch (error) {
            return res.status(401).json({ valid: false, message: "Invalid Token" });
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
