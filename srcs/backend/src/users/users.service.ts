import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, OnlineStatus, ReqState } from '@prisma/client'
import { UpdateUserDto } from './dto/UpdateUserDto';

const user = Prisma.validator<Prisma.UserDefaultArgs>()({})
export type User = Prisma.UserGetPayload<typeof user>

const game = Prisma.validator<Prisma.GameDefaultArgs>()({})
export type Game = Prisma.GameGetPayload<typeof game>

const player = Prisma.validator<Prisma.PlayerDefaultArgs>()({})
export type Player = Prisma.PlayerGetPayload<typeof player>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

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

	async getAllUsers() {
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

	async deleteUser(userId: number) {
		let user: User;
		try {
			user = await this.prisma.user.delete({
				where: {
					id: userId,
				}
			})
		} catch (err: any) {
			return ({error: 'user not found'})
		}
		return ({nickname: user.username});
	}

	//dont touch
	async getUserByUsername(username: string) {
		console.log('getUserByUsername', username);
		const user = await this.prisma.user.findUnique({
			where: {
				username,
			},
		});
		return user;
	}

	async getUserByNick(nick: string) {
		return (
			await this.prisma.user.findUnique({
				where: { username: nick },
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
					bio: true,
				}
			})
		)
	}

	async getNickById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		});
		if (!user) return (null);
		return (user.username);
	}

	async getUserProfile(id: number) {
		return (
			await this.prisma.user.findUnique({
				where: {id},
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
					bio: true, 
				}
			})
		)
	}


}
