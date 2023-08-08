
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Strategy } from 'passport-42';


// var FortyTwoStrategy = require('passport-42').Strategy;

// passport.use(new FortyTwoStrategy({
// 	clientID: FORTYTWO_APP_ID,
// 	clientSecret: FORTYTWO_APP_SECRET,
// 	callbackURL: "http://127.0.0.1:3000/auth/42/callback"
// },
// 	function (accessToken, refreshToken, profile, cb) {
// 		User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
// 			return cb(err, user);
// 		});
// 	}
// ));

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.FORTYTWO_APP_CALLBACK_URL,
		});
	}

	async validate(payload: any) {
		return { userId: payload.sub, username: payload.username };
	}
}
