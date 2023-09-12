import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library';

const user = Prisma.validator<Prisma.UserDefaultArgs>()({})
export type User = Prisma.UserGetPayload<typeof user>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	//dont touch
	async createUser(username: string, email: string, password: string) {
		return this.prisma.user.create({
			data: {
				username,
				email,
				password
			},
		});
	}

	// get a single user
	async getUserById(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
			include: {
				gameHistory: true,
				friend: true,
				sendFriendReq: true,
				recvFriendReq: true,
				block: true, 
			}
		});
		if (!user) return ({error: 'user not found'})
		// user.sendFriendReq.filter((x) => x.status != PENDING)
		// user.recvFriendReq.filter((x) => x.status != PENDING)
		delete user.email;
		delete user.password;
		delete user.u2fHash;
		delete user.activated2FA;
		return user;
	}

	async getAllUsers() {
		const users = await this.prisma.user.findMany({
			select: {
				username: true,
				avatar: true, 
				status: true,
			}
		});
		return users;
	}
	async updateUser(userId: number, data: { username?: string; email?: string; password?: string; bio?: string }) {
		let user: User;
		try {
			user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data,
			});
		} catch (err: any) {
			return ({error: 'user not found'});
		}
		return user;
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
}

