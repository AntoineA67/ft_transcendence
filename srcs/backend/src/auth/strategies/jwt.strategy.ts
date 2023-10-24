import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UsersService } from 'src/users/users.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
// 	constructor(private readonly userService: UsersService) {
// 		super({
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			ignoreExpiration: false,
// 			secretOrKey: jwtConstants.secret,
// 		});
// 		console.log("coucou3");
// 	}

// 	async validate(payload: any) {
// 		console.log("jwt validate", payload);
// 		const user = await this.userService.getUserByEmail(payload.sub);
// 		console.log("jwt validate user", user);

// 		if (!user) throw new UnauthorizedException('Please signup');

// 		return {
// 			id: payload.sub,
// 			email: payload.email,
// 			login: payload.login,
// 		};
// 	}
// }

import { Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-jwt';
// import { UsersService } from '../users/users.service';
// import { jwtConstants } from '../auth/constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly userService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	private logger = new Logger('jwtStrategy');

    // async validate(req: any, payload: any) {
	async validate(req: any) {
		this.logger.log('req', req);
		console.log("req", req);
      const user = await this.userService.getUserByEmail(req.email);
      if (!user) {
		throw new UnauthorizedException();
      }
      return user;
  }
}


