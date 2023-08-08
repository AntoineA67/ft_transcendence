import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User, UsersService } from './users.service';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@UseGuards(FortyTwoAuthGuard)
	@Get()
	async getAllGames(): Promise<User[]> {
		const users = await this.usersService.findAll();
		return users;
	}

	@UseGuards(FortyTwoAuthGuard)
	@Get(':username')
	async getGameById(@Param('username') username: string): Promise<User> {
		const user = await this.usersService.findOne(String(username));
		return user;
	}

	//   @Post()
	//   async createGame(@Body('name') name: string) {
	//     if (!name) {
	//       throw new Error('Content is required');
	//     }
	//     const newGame = await this.usersService.create(name);
	//     return newGame;
	//   }
}