import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService, private readonly authService: AuthService) { }

	@UseGuards(FortyTwoAuthGuard)
	@Get('/login')
	async login(@Req() req) {
		return this.authService.login(req.user);
	}

	// @Public()
	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		// return { message: '42 callback' };
		//console.log('42 callback', req.user);
		// const users = await this.usersService.findAll();
		console.log(req.query.code)

		// return '42 Callback';
		// return await req.user;
		res.status(HttpStatus.OK).json(req.user);

		// res.redirect('/');

		// const token = await this.authService.login(req.user);

		// res.cookie('access_token', token, {
		// 	maxAge: 2592000000,
		// 	sameSite: true,
		// 	secure: false,
		// });

		// return { token };

		// return users;
	}
}