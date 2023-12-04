import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, OnlineStatus, ReqState } from '@prisma/client'
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserDto } from 'src/dto/user.dto';
import { ProfileDto } from 'src/dto/profile.dto';
import { authenticator } from 'otplib';
import * as argon from 'argon2';
import { checkPassword } from 'src/room/roomDto';

const user = Prisma.validator<Prisma.UserDefaultArgs>()({})
export type User = Prisma.UserGetPayload<typeof user>

const game = Prisma.validator<Prisma.GameDefaultArgs>()({})
export type Game = Prisma.GameGetPayload<typeof game>

const player = Prisma.validator<Prisma.PlayerDefaultArgs>()({})
export type Player = Prisma.PlayerGetPayload<typeof player>

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) { }

	async createUser(username: string, email: string, password: string, avatar: string = null) {
		try {
			let hashPassword;
			if (password == "nopass")
				hashPassword = "nopass";
			else
				hashPassword = await argon.hash(password);
			const user = await this.prisma.user.create({
				data: {
					username: username,
					email: email,
					hashPassword: hashPassword,
					avatar: avatar,
				},
			});
			const achieve = await this.prisma.achievement.create({
				data: {
					userId: user.id,
				}
			});
			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credentials taken');
				}
			}
			else if (error instanceof Error)
				throw new BadRequestException('Could not create user');
		}
	}

	async getAllUsers(): Promise<UserDto[]> {
		try {
			return await this.prisma.user.findMany({
				select: {
					id: true,
					username: true,
					avatar: true,
					status: true,
				}
			});
		} catch (error) {
			return [];
		}
	}

	async checkDataforUserUpdate(data: UpdateUserDto): Promise<boolean> {
		try {
			const printableCharactersRegex = /^[ -~]*$/;
			for (const prop in data) {
				if (data[prop] !== undefined && typeof data[prop] === 'string') {
					if (!printableCharactersRegex.test(data[prop])) {
						return false;
					}
				}
			}

			if (data && data.id && data.id !== undefined) {
				if (typeof data.id !== 'number') {
					return false;
				}
			}

			if (data && data.email && data.email !== undefined) {
				if (typeof data.email !== 'string') {
					return false;
				}
			}

			if (data && data.username && data.username !== undefined) {
				if (typeof data.username !== 'string') {
					return false;
				}

				const validUsernameRegex = /^[A-Za-z0-9-]{3,16}$/;
				if (!validUsernameRegex.test(data.username)) {
					return false;
				}
			}

			if (data && data.password && data.password !== undefined) {
				if (typeof data.password !== 'string') {
					return false;
				}
				if (data.password.length < 8 || data.password.length > 20) {
					return false;
				}
				const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
				if (!passwordRegex.test(data.password)) {
					return false;
				}
			}

			if (data && data.bio && data.bio !== undefined) {
				if (typeof data.bio !== 'string') {
					return false;
				}
				if (data.bio.length > 200) {
					return false;
				}
			}
			return true;
		} catch (error) {
			return false;
		}
	}


	async updateUser(id: number, data: UpdateUserDto): Promise<boolean> {
		const bool = await this.checkDataforUserUpdate(data);
		if (!bool)
			return false;
		let user: User;
		try {
			if (data.password) {
				const hashPassword = await argon.hash(data.password);
				data.password = hashPassword;
			}
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

	async getUserByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: email,
			}
		});
		return user;
	}

	async getIdByNick(username: string) {
		const user = await this.prisma.user.findUnique({
			where: { username: username }
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

	async getUserById(id: number): Promise<UserDto | null> {
		return await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				username: true,
				avatar: true,
				status: true,
				activated2FA: true,
			}
		})
	}

	async getUserByNick(nick: string): Promise<UserDto> {
		return await this.prisma.user.findUnique({
			where: { username: nick },
			select: {
				id: true,
				username: true,
				avatar: true,
				status: true,
			}
		})
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
		authenticator.verify({
			token: token,
			secret: user.otpHash
		})
		return (authenticator.verify({
			token: token,
			secret: user.otpHash
		}));
	}

	async getHalfProfile(id: number): Promise<ProfileDto | null> {
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
		if (!profile) {
			return (null);
		}
		if (profile && profile.hashPassword === "nopass") {
			profile = { ...profile, password: false } as any;
		} else {
			profile = { ...profile, password: true } as any;
		}
		delete profile.hashPassword;
		return ({
			...profile,
			friend: null, block: null, blocked: null, sent: null,
			gameHistory: [], achieve: null
		})
	}

	async getAvatar(id: number): Promise<string | null> {
		let { avatar } = await this.prisma.user.findUnique({
			where: { id },
			select: {
				avatar: true,
			}
		});
		return (avatar);
	}

	async changePassword(id: number, oldPassword: string, newPassword: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: id }
		});

		if (!user) {
			return false;
		}

		try {

			const passwordMatch = await argon.verify(user.hashPassword, oldPassword);
			if (passwordMatch) {
				if (!checkPassword(newPassword))
					return false;
				const hashNewPassword = await argon.hash(newPassword);
				await this.prisma.user.update({
					where: { id: id },
					data: { hashPassword: hashNewPassword }
				});
				return (true);
			}
			return (false);
		} catch (error) {
			return false;
		}
	}

}