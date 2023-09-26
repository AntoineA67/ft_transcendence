
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Strategy } from 'passport-42';
import passport from 'passport';
import { User, UsersService } from '../users/users.service';
import { AuthService } from './auth.service';


// var FortyTwoStrategy = require('passport-42').Strategy;
// var usersService = require('../users/users.service');

// passport.use(new FortyTwoStrategy({
// 	clientID: process.env.FORTYTWO_APP_ID,
// 	clientSecret: process.env.FORTYTWO_APP_SECRET,
// 	callbackURL: process.env.FORTYTWO_APP_CALLBACK_URL,
// 	profileFields: {
// 		'id': function (obj) { return String(obj.id); },
// 		'username': 'login',
// 		'displayName': 'displayname',
// 		'name.familyName': 'last_name',
// 		'name.givenName': 'first_name',
// 		'profileUrl': 'url',
// 		'emails.0.value': 'email',
// 		'phoneNumbers.0.value': 'phone',
// 		'photos.0.value': 'image_url'
// 	}
// },
// 	function (accessToken, refreshToken, profile, cb) {
// 		console.log('FortyTwoStrategy', accessToken, refreshToken, profile);
// 		usersService.findOrCreate({ username: profile.id }, function (err, user) {
// 			return cb(err, user);
// 		});
// 	}
// ));

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private readonly usersService: UsersService, private readonly authService: AuthService) {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.FORTYTWO_APP_CALLBACK_URL,
			profileFields: {
				'id': function (obj) { return String(obj.id); },
				'username': 'login',
				'displayName': 'displayname',
				'name.familyName': 'last_name',
				'name.givenName': 'first_name',
				'profileUrl': 'url',
				'emails.0.value': 'email',
				'phoneNumbers.0.value': 'phone',
				'photos.0.value': 'image_url'
			}
			// }, (accessToken: string, refreshToken: string, profile: any, cb: any) => {
			// 	console.log('FortyTwoStrategy', accessToken, refreshToken, profile);
			// 	return cb(null, profile);
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, cb: any): Promise<any> {
		// You can implement your own logic to find or create the user here
		//console.log('accessToken', accessToken, refreshToken, profile);
		// const user: any = await this.usersService.findOrCreate(profile.username).then(
		//console.log("profile ===>", profile);
		const user: any = await this.authService.login(profile).then(
			(user) => {
				//console.log('user', user);
				return cb(null, user);
			});

		// Return the user or throw an error if something goes wrong
		// if (!user) {
		// 	throw new Error('User not found or could not be created.');
		// }

		// Returning the user object will be accessible in the request via `req.user`
		// return await { login: user.login }
		// console.log('awaiting user, will return')
		// cb(null, user);
		// return await user;
		// return cb(null, user);
	}
}