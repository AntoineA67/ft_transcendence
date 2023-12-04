import { BadRequestException, NotFoundException, Req, Res, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/guards/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { Intra42Dto, SigninDto, SignupDto, CallBackDto } from '../dto';

@Controller('api/auth')
export class AuthController {
	constructor(
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
		public jwtService: JwtService

	) { }

	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(@Body() dto: SignupDto) {
		try {
			if (!dto || Object.keys(dto).length === 0) {
				return;
			}
			if (typeof dto.username !== 'string' || dto.username.length > 50) {
				return;
			}
			if (typeof dto.email !== 'string' || dto.email.length > 50) {
				return;
			}
			if (typeof dto.password !== 'string' || dto.password.length > 50) {
				return;
			}
			const result = await this.authService.signup(dto);
			return result;
		} catch (e: any) {
			if (e instanceof BadRequestException)
				throw new BadRequestException(e.message);
			return;
		}
	}

	@Public()
	@Post('signin')
	@HttpCode(HttpStatus.OK)
	async signin(@Body() dto: SigninDto) {
		try {
			return await this.authService.signin(dto);
		} catch (e: any) {
			if (e instanceof BadRequestException)
				throw new BadRequestException(e.message);
			else if (e instanceof UnauthorizedException)
				throw new UnauthorizedException(e.message);
			else if (e instanceof NotFoundException)
				throw new NotFoundException(e.message);
			else if (e instanceof ForbiddenException)
				throw new ForbiddenException(e.message);
			
			return;
		}
	}

	@Public()
	@Post('signout')
	@HttpCode(HttpStatus.OK)
	async signout(@Req() req: Request) {
		try {
			const refreshToken = req.body.refreshToken;
			if (refreshToken === undefined) {
				return;
			}
			if (typeof refreshToken !== 'string') {
				return;
			}
			if (refreshToken.length > 100) {
				return;
			}
			const result = await this.authService.signout(refreshToken);
			return result;
		} catch (e: any) {
			if (e instanceof BadRequestException)
				throw new BadRequestException(e.message);
			return;
		}
	}

	@UseGuards(FortyTwoAuthGuard)
	@Get('/42/callback')
	@HttpCode(HttpStatus.OK)
	async fortyTwoCallback(@Req() req: CallBackDto, @Res() res): Promise<any> {

		try {
			const dto: Intra42Dto = {
				id: req.user.id,
				email: req.user.email,
				token2FA: req.query._2fa,
				activated2FA: req.user.activated2FA,
				user: req.user,
				firstConnexion: req.user.firstConnexion,
			}

			if (typeof dto.id !== 'number' || dto.id < 0 || dto.id > 1000000) {
				return;
			}
			if (typeof dto.email !== 'string' || dto.email.length > 50) {
				return;
			}
			if (dto.token2FA && (typeof dto.token2FA !== 'string' || dto.token2FA.length > 6)) {
				return;
			}
			if (dto.activated2FA && (typeof dto.activated2FA !== 'boolean')) {
				return;
			}
			if (dto.firstConnexion && (typeof dto.firstConnexion !== 'string' || dto.firstConnexion.length > 10)) {
				return;
			}
			const result = await this.authService.signin42(dto, res, req);
			return result;
		}
		catch (e: any) {
			if (e instanceof BadRequestException)
				throw new BadRequestException(e.message);
			return;
		}
	}

	@Public()
	@Get('/_2fa/id=:id&token=:token')
	async twoFactorAuth(@Res() res, @Param('id') id: string, @Param('token') token: string): Promise<any> {
		try {
			if (id.length > 6 || token.length > 6) {
				res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'error' });
				return;
			}
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
		} catch (error) {
			res.status(HttpStatus.UNAUTHORIZED).json({ '_2fa': 'error' });
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('isTokenValid')
	@HttpCode(HttpStatus.OK)
	async isTokenValid(@Req() req: Request, @Res() res: Response) {
		return res.status(200).json({ valid: true, message: "Token is valid" });
	}

	@Post('refreshToken')
	@HttpCode(HttpStatus.CREATED)
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		if (typeof req.body.refreshToken !== 'string' || req.body.refreshToken.length > 100) {
			return res.status(401).json({ message: "refresh token is invalid" });
		}
		if (req.body.refreshToken === undefined) {
			return res.status(401).json({ message: "refresh token is undefined" });
		}
		try {
			const result = await this.authService.refreshToken(req.body.refreshToken, req, res);
			return res.status(201).json(result);
		} catch (error) {
			return res.status(401).json({ message: "refresh token is invalid" });
		}
	}
}