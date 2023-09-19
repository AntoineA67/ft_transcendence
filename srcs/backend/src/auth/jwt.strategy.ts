
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly userService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any) {
		console.log('jwt validate', payload);
		const user = await this.userService.getUserByLogin42(payload.sub);
		console.log('jwt validate user', user);

		if (!user) throw new UnauthorizedException('Please log in to continue');

		return {
			id: payload.sub,
			email: payload.email,
			login: payload.login,
		};
	}
}
