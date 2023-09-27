import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService, private readonly authService: AuthService, public jwtService: JwtService) { }

	// @UseGuards(FortyTwoAuthGuard)
	// @Get('/login')
	// async login(@Req() req) {
	// 	return this.authService.login(req.user);
	// }

	// @Public()
	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		// return { message: '42 callback' };
		// console.log('42 callback', req.user);
		// // const users = await this.usersService.findAll();
		// console.log("code =>",req.query.code);
		//console.log("token =>",req.query.token);

		// return '42 Callback';
		// return await req.user;
		// if (req.query.token)
			//req.user.token = 494554;
			// console.log("req", req);
		
		//console.log("2323>>>>>>",req.user);

		let jsonRes;

		//console.log(req.user);

		console.log("TOKEN _>>", req.query.token);

		if (!req.query.token && req.user.activated2FA) {
			jsonRes = { id: req.user.id , _2fa: true };
		} else if (req.query.token && req.user.activated2FA) { 
			const isValid = await this.usersService.verify2FA(req.user, req.query.token);
			console.log('token valid ->>', isValid);
			if (isValid) {
				jsonRes = this.jwtService.sign({
					id: req.user.id,
					sub: req.user.username,
					email: req.user.email,
					login: req.user.username,
				}, { expiresIn: 3600 });
			} else {
				jsonRes = { error: '2fa' };
			}
		}

		// jsonRes = this.jwtService.sign({
		// 	id: req.user.id,
		// 	sub: req.user.username,
		// 	email: req.user.email,
		// 	login: req.user.username,
		// }, { expiresIn: 3600 });

		res.status(HttpStatus.OK).json(jsonRes);
		//res.status(HttpStatus.OK).json("test");

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