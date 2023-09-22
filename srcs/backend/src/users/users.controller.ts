import { Body, Controller, Get, Param, Post, UseGuards, Patch } from '@nestjs/common';
import { User, UsersService } from './users.service';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get()
	async getUsers() {
		return await (this.usersService.getAllUsers());
	}
	
	// @Get(':nick')
	// async getUser(@Param('nick') nick: string): Promise<any> {
	// 	// return ('wtf')
	// 	let res: any;
	// 	try {
	// 		res =  await (this.usersService.getUserByNick(nick));
	// 	} catch (err: any) {
	// 		return ('wtf');
	// 	}
	// 	return (res);
	// }
	
	// @Patch(':nick')
	// async updateUser(@Param('nick') nick: string, @Body() body) {
	// 	return await (this.usersService.updateUser(nick, body.data));
	// }

	// @UseGuards(JwtAuthGuard)
	// @Get()
	// async getAllGames(): Promise<string> {
	// 	console.log("/users")
	// 	const users = await this.usersService.getAllUsers();
	// 	const toObject = (oui) => {
	// 		return JSON.parse(JSON.stringify(oui, (key, value) =>
	// 			typeof value === 'bigint'
	// 				? value.toString()
	// 				: value // return everything else unchanged
	// 		));
	// 	}
	// 	console.log(users);
	// 	return JSON.stringify(users);
	// }



	// @UseGuards(LocalAuthGuard)
	// @Post('/test')
	// async getGameById(@Param('username') username: string): Promise<User> {
	// 	const user = await this.usersService.getUserByUsername(String(username));
	// 	return user;
	// }

	//   @Post()
	//   async createGame(@Body('name') name: string) {
	//     if (!name) {
	//       throw new Error('Content is required');
	//     }
	//     const newGame = await this.usersService.create(name);
	//     return newGame;
	//   }
}