
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<any> {
		// console.log('LocalStrategy validate', username, password);
		// const user = await this.authService.login({ user: { login: username } });
		// // const user = null
		// if (!user) {
		// 	throw new UnauthorizedException();
		// }
		// return user;
	}
}