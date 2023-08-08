import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService) { }

	// @UseGuards(FortyTwoAuthGuard)
	@Public()
	@Get('/42/callback')
	async fortyTwoCallback(): Promise<any> {
		// return { message: '42 callback' };
		const users = await this.usersService.findAll();
		return users;
	}
}