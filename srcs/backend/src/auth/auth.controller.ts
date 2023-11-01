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
		// this.logger.log("coucou", dto);
		// let response = await this.authService.signup(dto, res);
        // res.status(HttpStatus.OK).json(response);
		return await this.authService.signup(dto);

    }

    @Public()
    @Post('signin')
	@HttpCode(HttpStatus.OK)
	async signin(@Body() dto: SigninDto) {
		// const response = await this.authService.signin(dto, res, req);
        // res.status(HttpStatus.OK).json(response);
        return this.authService.signin(dto);
    }

	// @Public()
    // @Post('signout') 
    // async signout(@Req() req: Request, @Res() res: Response) {
    //     const response = await this.authService.signout(req);
	// 	res.status(HttpStatus.OK).json(response);
    // }

	@Public()
	@Post('signout')
	@HttpCode(HttpStatus.OK)
	async signout(@Req() req: Request) {
		const refreshToken = req;
		return await this.authService.signout(refreshToken);
	}

	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	// async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
	async fortyTwoCallback(@Req() req, @Res() res): Promise<any> {
		const dto: Signin42Dto = {
			id: req.user.id,
			email: req.user.email,
			token2FA: req.query._2fa,
			activated2FA: req.user.activated2FA,
			user: req.user,
		}
		const response = await this.authService.signin42(dto, res, req);
		return response;
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

	@UseGuards(JwtAuthGuard)
	@Get('isTokenValid')
    async isTokenValid(@Req() req: Request, @Res() res: Response) {
		return res.status(200).json({ valid: true, message: "Token is valid" });
    }

	@Post('refreshToken')
	async refreshToken(@Req() req: Request, @Res() res: Response)
	{
		console.log("passing by refreshToken");
		const ret = await this.authService.refreshToken(req.body.refreshToken, req, res);
		console.log('refersh token: ', ret)
		return res.status(201).json(ret);
	}
}
