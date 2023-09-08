import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(username: string, email: string, password: string) {
    return this.prisma.user.create({
      data: {
        username,
		email: email,
        password,
		bio: "",
      },
    });
  }

  async getUserById(userId: number): Promise<User> {
    return this.findUserById(userId);
  }

	async updateUser(userId: number, data: { username?: string; email?: string; password?: string; bio?: string }) {
    const user = await this.findUserById(userId);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });

    return updatedUser;
  }

  async deleteUser(userId: number): Promise<User> {
    const user = await this.findUserById(userId);
    const deletedUser = await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return deletedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username,
      },
    });
  }

  async getUsersByEmail(email: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        email,
      },
    });

    this.handleUsersNotFound(users, `No users found with email ${email}`);
    return users;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
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
        id: userId,
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

  private handleUsersNotFound(users: User[], errorMessage: string) {
    if (users.length === 0) {
      throw new NotFoundException(errorMessage);
    }
  }
}
