
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
	constructor(private readonly userService: UsersService, private jwtService: JwtService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any) {
		console.log('jwt validate', payload);
		return payload;
		return this.jwtService.verify(payload);
		const user = await this.userService.getUserByUsername(payload.sub);

		if (!user) throw new UnauthorizedException('Please log in to continue');

		return {
			id: payload.sub,
			email: payload.email,
			login: payload.login,
		};
	}
}
