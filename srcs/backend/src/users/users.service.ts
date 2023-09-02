import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export type User = any;

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	async createUser(username: string, email: string, password: string) {
		return this.prisma.user.create({
			data: {
				username,
				email_address: email,
				password,
			},
		});
	}

	async getUserById(userId: number) {
		const user = await this.findUserById(userId);
		return user;
	}

	async updateUser(userId: number, data: { username?: string; email?: string; password?: string; bio?: string }) {
		const user = await this.findUserById(userId);
		const updatedUser = await this.prisma.user.update({
			where: {
				user_id: userId,
			},
			data,
		});

		return updatedUser;
	}

	async deleteUser(userId: number) {
		const user = await this.findUserById(userId);
		const deletedUser = await this.prisma.user.delete({
			where: {
				user_id: userId,
			},
		});

		return deletedUser;
	}

	async getAllUsers() {
		const users = await this.prisma.user.findMany();
		return users;
	}

	async getUserByUsername(username: string) {
		console.log('getUserByUsername', username);
		const user = await this.prisma.user.findFirst({
			where: {
				username,
			},
		});

		// if (!user) {
		// 	throw new NotFoundException(`User with username ${username} not found`);
		// }

		return user;
	}


	async getUsersByEmail(email: string) {
		const users = await this.prisma.user.findMany({
			where: {
				email_address: email,
			},
		});

		this.handleUsersNotFound(users, `No users found with email ${email}`);
		return users;
	}

	async updateUserPassword(userId: number, newPassword: string) {
		const updatedUser = await this.prisma.user.update({
			where: {
				user_id: userId,
			},
			data: {
				password: newPassword,
			},
		});

		return updatedUser;
	}

	private async findUserById(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				user_id: userId,
			},
		});

		this.handleUserNotFound(user, `User with ID ${userId} not found`);
		return user;
	}

	private handleUserNotFound(user: any, errorMessage: string) {
		if (!user) {
			throw new NotFoundException(errorMessage);
		}
	}

	private handleUsersNotFound(users: any[], errorMessage: string) {
		if (users.length === 0) {
			throw new NotFoundException(errorMessage);
		}
	}

	// private readonly users = [
	// 	{
	// 		userId: 1,
	// 		username: 'john',
	// 		password: 'changeme',
	// 	},
	// 	{
	// 		userId: 2,
	// 		username: 'maria',
	// 		password: 'guess',
	// 	},
	// ];

	// async findOne(username: string): Promise<User | undefined> {
	// 	return this.users.find(user => user.username === username);
	// }
}

