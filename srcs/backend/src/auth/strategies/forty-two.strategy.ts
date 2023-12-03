
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private readonly usersService: UsersService, private readonly authService: AuthService) {
		super({
			clientID: process.env.REACT_APP_FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.REACT_APP_FRONTEND_URL + '/42/callback',
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
		});
	}

	async validate(token: string, refreshToken: string, profile: any, cb: any): Promise<any> {
		// You can implement your own logic to find or create the user here
		const user: any = await this.authService.login42(profile).then(
			(user) => {
				return cb(null, user);
			}).catch((err) => {
				return cb(err, null);
			});
	}
}