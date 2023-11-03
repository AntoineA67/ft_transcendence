import { Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from 'src/users/users.service';

import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';


import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	UseGuards,
	HttpCode,
	HttpStatus,
  } from '@nestjs/common';
  import { FortyTwoAuthGuard } from 'src/auth/guards/forty-two-auth.guard';
  import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  import { Public } from './public.decorator';
  import { AuthService } from './auth.service';
  import { Signin42Dto, SigninDto, SignupDto } from '../dto';

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
	@HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: SignupDto) {
		return await this.authService.signup(dto);
    }

    @Public()
    @Post('signin')
	@HttpCode(HttpStatus.OK)
	async signin(@Body() dto: SigninDto) {
        return this.authService.signin(dto);
    }

	@Public()
	@Post('signout')
	@HttpCode(HttpStatus.OK)
	async signout(@Req() req: Request) {
		const refreshToken = req;
		return await this.authService.signout(refreshToken);
	}

	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	@HttpCode(HttpStatus.OK)
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		const dto: Signin42Dto = {
			id: req.user.id,
			email: req.user.email,
			token2FA: req.query._2fa,
			activated2FA: req.user.activated2FA,
			user: req.user,
		}
		return await this.authService.signin42(dto, res, req);
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

	@UseGuards(JwtAuthGuard)
	@Get('isTokenValid')
	@HttpCode(HttpStatus.OK)
    async isTokenValid() {
		return { valid: true, message: "Token is valid" };
    }

	@Post('refreshToken')
	@HttpCode(HttpStatus.CREATED)
	async refreshToken(@Req() req: Request)
	{
		const refreshToken = req.body.refreshToken;
		return await this.authService.refreshToken(refreshToken);
	}
}
