import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, OnlineStatus, ReqState } from '@prisma/client'
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserDto } from 'src/dto/UserDto';
import { ProfileDto } from 'src/dto/ProfileDto';
import { authenticator } from 'otplib';

const user = Prisma.validator<Prisma.UserDefaultArgs>()({})
export type User = Prisma.UserGetPayload<typeof user>

const game = Prisma.validator<Prisma.GameDefaultArgs>()({})
export type Game = Prisma.GameGetPayload<typeof game>

const player = Prisma.validator<Prisma.PlayerDefaultArgs>()({})
export type Player = Prisma.PlayerGetPayload<typeof player>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	//dont touch
	async createUser(username: string, email: string, password: string) {
		return await this.prisma.user.create({
			data: {
				username,
				email,
				password
			},
		});
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
	async getUserByUsername(username: string) {
		//console.log('getUserByUsername', username);
		const user = await this.prisma.user.findUnique({
			where: {
				username,
			},
		});
		return user;
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

	// async getNickById(id: number) {
	// 	const user = await this.prisma.user.findUnique({
	// 		where: { id }
	// 	});
	// 	if (!user) return (null);
	// 	return (user.username);
	// }

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
				username: true, 
				avatar: true, 
				bio: true, 
				status: true
			}
		});
		return ({ ... profile, 
			friend: null, block: null, blocked: null, sent: null })
	}

	async getUserProfileByNick(nick: string): Promise<ProfileDto | null> {
		let profile =  await this.prisma.user.findUnique({
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
			friend: null, block: null, blocked: null, sent: null
		})
	}

	async generate2FASecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, 'AUTH_APP_NAME', secret);
		return {
			secret,
			otpauthUrl
		}
	}

	async verify2FA(user: any, token: string) {
		user = await this.prisma.user.findUnique({
			where: { id: user.id }
		});
		return (authenticator.verify({
			token: token,
			secret: user.otpHash
		}));
	}

}
