import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, OnlineStatus, ReqState } from '@prisma/client'
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserDto } from 'src/dto/user.dto';
import { ProfileDto } from 'src/dto/profile.dto';
import { authenticator } from 'otplib';
import * as argon from 'argon2';

const user = Prisma.validator<Prisma.UserDefaultArgs>()({})
export type User = Prisma.UserGetPayload<typeof user>

const game = Prisma.validator<Prisma.GameDefaultArgs>()({})
export type Game = Prisma.GameGetPayload<typeof game>

const player = Prisma.validator<Prisma.PlayerDefaultArgs>()({})
export type Player = Prisma.PlayerGetPayload<typeof player>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	// async createUser(username: string, email: string, password: string) {
	// 	return await this.prisma.user.create({
	// 		data: {
	// 			username,
	// 			email,
	// 			password
	// 		},
	// 	});
	// }

	async createUser(username: string, email: string, password: string) {
		const hashPassword = await argon.hash(password);
		try {
			const user = await this.prisma.user.create({
				data: {
					username: username,
					email: email,
					hashPassword: hashPassword,
				},
			});
			return user;
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

	async getAllUsers(): Promise<UserDto[]> {
		const users = await this.prisma.user.findMany({
			select: {
				id: true,
				username: true,
				avatar: true,
				status: true,
			}
		});
		return users;
	}

	async updateUser(id: number, data: UpdateUserDto): Promise<boolean> {
		let user: User;
		try {
			user = await this.prisma.user.update({
				where: { id },
				data
			});
		} catch (err: any) {
			return (false);
		}
		return (true);
	}

	async deleteUser(userId: number): Promise<boolean> {
		let user: User;
		try {
			user = await this.prisma.user.delete({
				where: {
					id: userId,
				}
			})
		} catch (err: any) {
			return (false)
		}
		return (true);
	}

	//dont touch
	async getUserByEmail(email: string) {
		console.log('getUserByEmail', email);
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		});
		return user;
	}

	async getIdByNick(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email: email	}
		});
		if (!user) return (null);
		return (user.id);
	}

	async getNickById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		});
		if (!user) return (null);
		return (user.username);
	}

	async getUserBasic(id: number) {
		return (
			await this.prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
				}
			})
		)
	}

	async getUserById(id: number): Promise<UserDto> {
		return (
			await this.prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
					activated2FA: true,
				}
			})
		)
	}

	// the freind, block, blocked should be given by other services
	async getUserProfileById(id: number): Promise<ProfileDto | null> {
		let profile = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				hashPassword: true,
				username: true,
				avatar: true,
				bio: true,
				status: true,
				activated2FA: true,
			}
		});
		if (profile && profile.hashPassword === "nopass") {
			profile = { ...profile, hashPassword: "nopass" };
		} else {
			profile = { ...profile, hashPassword: null };
		}
		return ({
			...profile,
			friend: null, block: null, blocked: null, sent: null,
			gameHistory: [], achieve: null
		})
	}

	async getUserProfileByNick(nick: string): Promise<ProfileDto | null> {
		let profile = await this.prisma.user.findUnique({
			where: { username: nick },
			select: {
				id: true,
				username: true,
				avatar: true,
				bio: true,
				status: true,
			}
		});
		return ({
			...profile,
			friend: null, block: null, blocked: null, sent: null,
			gameHistory: [], achieve: null
		})
	}

	async getUserByNick(nick: string): Promise<UserDto> {
		return (
			await this.prisma.user.findUnique({
				where: { username: nick },
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
				}
			})
		)
	}

	async getUserByUsername(username: string): Promise<User> {
		try {
            const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            throw new NotFoundException(`User not found with id ${username}`);
        }
        return user;
        } catch (error) {
            console.error(`Error fetching user with username ${username}`, error);
            throw error;
        }
	}

	async generate2FASecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, process.env.APP_NAME, secret);
		return {
			secret,
			otpauthUrl
		}
	}

	async verify2FA(user: any, token: string) {
		user = await this.prisma.user.findUnique({
			where: { id: user.id }
		});
		console.log('user', user);
		console.log('token', token);
		console.log('otp', authenticator.verify({
			token: token,
			secret: user.otpHash
		}))
		return (authenticator.verify({
			token: token,
			secret: user.otpHash
		}));
	}

}
