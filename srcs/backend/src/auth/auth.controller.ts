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
		let jsonRes;


		console.log("2fa _>>", req.query._2fa);

		if (!req.query._2fa && req.user.activated2FA) {
			jsonRes = { id: req.user.id , _2fa: true };
		} else if (req.query._2fa && req.user.activated2FA) { 
			const isValid = await this.usersService.verify2FA(req.user, req.query._2fa);
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
		res.status(HttpStatus.OK).json(jsonRes);
	}
}