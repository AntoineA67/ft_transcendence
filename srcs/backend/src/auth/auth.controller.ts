import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService, private readonly authService: AuthService, public jwtService: JwtService) { }

	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		let response;

		// if 2fa is activated and user have not send token
		if (!req.query._2fa && req.user.activated2FA) {
			response = { id: req.user.id, _2fa: true };
			// if 2fa is activated and user have send token
		} else if (req.query._2fa && req.user.activated2FA) {
			const _2faValid = await this.usersService.verify2FA(req.user, req.query._2fa);
			if (_2faValid) {
				response = this.createJWT(req);
			} else {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'need token' });
			}
			// no 2fa
		} else {
			response = this.createJWT(req);
		}
		res.status(HttpStatus.OK).json(response);
	}

	@Public()
	@Get('/_2fa/id=:id&token=:token')
	async twoFactorAuth(@Res() res, @Param('id') id: string, @Param('token') token: string): Promise<any> {
		const user = await this.usersService.getUserById(Number(id));
		if (!user) {
			res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'error' });
			return;
		}
		const _2faValid = await this.usersService.verify2FA(user, token);
		if (_2faValid) {
			res.status(HttpStatus.OK).json({ '_2fa': 'success' });
		} else {
			res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'error' });
		}
	}

	createJWT(req: any) {
		let payload = {
			id: req.user.id,
			sub: req.user.username,
			email: req.user.email,
			login: req.user.username,
		}
		return this.jwtService.sign(payload, { expiresIn: 3600 });
	}
}