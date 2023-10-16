import { Injectable, ForbiddenException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import * as randomstring from 'randomstring';
import { AuthDto } from '../dto';
import { jwtConstants } from './constants';
import { randomBytes } from 'crypto';

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


	async signup(dto: AuthDto, res: Response) {
		const hashPassword = await argon.hash(dto.password);
		try {
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
					throw new ForbiddenException('Credentials taken');
				}
			}
			throw error;
		}
	  }
  
	  async signin(dto: AuthDto, res: Response) {
		  // find user with email
		  const user = await this.usersService.getUserByEmail(dto.email);
		  // if user not found throw exception
		  if (!user)
			  throw new ForbiddenException('Username not found',);
		  // compare password
		  const passwordMatch = await argon.verify(user.hashPassword, dto.password,);
		  // if password wrong throw exception
		  if (!passwordMatch)
			  throw new ForbiddenException('Incorrect password',);
		  // send back the token
		  return this.signToken(user.id, res);
	  }
  
	  async validateUser(dto: AuthDto): Promise <any> {
		const user = await this.usersService.getUserByEmail(dto.email);
		if (!user)
		  throw new UnauthorizedException();      
		return user;
	  }
  
	  async signToken(
		  userId: number,
		  res: Response
	  ): Promise<void> {
		  const payload = {
			  sub: userId,
		  };
		  const secret = this.JWT_SECRET;
		  const token = await this.jwt.signAsync(
			  payload,
			  {
				  expiresIn: '15m',
				  secret: secret,
			  },
		  );
  
		  // Generate a refresh token
		  const refreshToken = await this.createRefreshToken(userId);
		  console.log('refresh token = ');
		  console.log(refreshToken);
		  console.log('token = ');
		  console.log(token);
  
		  // Save refresh token in an HttpOnly cookie
		  res.cookie('refreshToken', refreshToken, {
			  httpOnly: true,
			  secure: true, // set it to false if you're not using HTTPS
			  sameSite: 'none',
			  maxAge: 1000 * 60 * 60 * 24 * 30 * 30  // 30 days in milliseconds
		  });
  
		  // Existing JWT token cookie
		  res.cookie('token', token, {
			  httpOnly: true,
			  secure: true,
			  sameSite: 'none',
			  maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
		  });
  
		  res.status(200).send({ message: 'Authentication successful' });
		  // return {
		  //     access_token: token
		  // }
	  }
	
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

	async createRefreshToken(userId: number): Promise<string> {
        const refreshToken = randomBytes(40).toString('hex'); // Generates a random 40-character hex string

        const expiration = new Date();

        expiration.setDate(expiration.getDate() + 7); // Set refreshToken expiration date within 7 days

        // Save refreshToken to database along with userId
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: userId,
                expiresAt: expiration
            }
        });

        return refreshToken;
    }
}
