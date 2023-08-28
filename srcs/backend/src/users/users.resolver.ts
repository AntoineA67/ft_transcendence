import 'reflect-metadata';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { user as User } from '../prisma/@generated/user/user.model'; // Assurez-vous que le chemin est correct
import { UsersService } from './users.service';

@Resolver(User)
export class UsersResolver {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    private usersService: UsersService,
  ) {}

  @Mutation((returns) => User)
  async createUser(
    @Args('username') username: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<User> {
    return this.usersService.createUser(username, email, password);
  }

  @Query((returns) => User)
  async getUserById(@Args('userId') userId: number): Promise<User> {
    return this.usersService.getUserById(userId);
  }

  @Query((returns) => User)
  async getUserByUsername(
    @Args('username') username: string,
  ): Promise<User> {
    return this.usersService.getUserByUsername(username);
  }

  // Ajoutez d'autres méthodes de requête GraphQL ici
}
