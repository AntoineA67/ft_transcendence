import { Controller, Get, Post, Body, HttpStatus, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { UsersService } from 'src/users/users.service';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { AuthDto } from '../dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly usersService: UsersService, 
		private readonly authService: AuthService,
		public jwtService: JwtService
		
		) { }

	private logger = new Logger('auth');

	@Public()
    @Post('signup')
    async signup(@Body() dto: AuthDto, @Res() res: Response) {
		this.logger.log("coucou", dto);
        return this.authService.signup(dto, res);
    }

    @Public()
    @Post('signin') // delete async, has to signin and cannot do anything else
    async signin(@Body() dto: AuthDto, @Res() res: Response, @Req() req: Request) {
        console.log("Request ===", req.user);
        return this.authService.signin(dto, res);
    }


	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		let response;
		
		this.logger.log('/42/callback');

		// if 2fa is activated and user have not send token
		if (!req.query._2fa && req.user.activated2FA) {
			response = { id: req.user.id, _2fa: true };
		// if 2fa is activated and user have send token
		} else if (req.query._2fa && req.user.activated2FA) {
			const _2faValid = await this.usersService.verify2FA(req.user, req.query._2fa);
			if (_2faValid) {
				response = this.authService.createJWT(req);
			} else {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'need token' });
			}
			// no 2fa
		} else {
			response = this.authService.createJWT(req);
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

	@Public()
    @Get('42Url')
    async get42Url() {
        const url = "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.FORTYTWO_APP_ID + "&redirect_uri=" + process.env.FORTYTWO_APP_CALLBACK_URL + "response_type=code";
        return (url);
    }
}
