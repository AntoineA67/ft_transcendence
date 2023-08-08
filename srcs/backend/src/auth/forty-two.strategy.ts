
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Strategy } from 'passport-42';
import passport from 'passport';
import { User, UsersService } from '../users/users.service';


// var FortyTwoStrategy = require('passport-42').Strategy;
// var usersService = require('../users/users.service');

// passport.use(new FortyTwoStrategy({
// 	clientID: process.env.FORTYTWO_APP_ID,
// 	clientSecret: process.env.FORTYTWO_APP_SECRET,
// 	callbackURL: process.env.FORTYTWO_APP_CALLBACK_URL
// },
// 	function (accessToken, refreshToken, profile, cb) {
// 		usersService.findOrCreate({ username: profile.id }, function (err, user) {
// 			return cb(err, user);
// 		});
// 	}
// ));

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private readonly usersService: UsersService) {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.FORTYTWO_APP_CALLBACK_URL,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
		// You can implement your own logic to find or create the user here
		const user = await this.usersService.findOrCreate(profile.id);

		// Return the user or throw an error if something goes wrong
		if (!user) {
			throw new Error('User not found or could not be created.');
		}

		// Returning the user object will be accessible in the request via `req.user`
		return user;
	}
}