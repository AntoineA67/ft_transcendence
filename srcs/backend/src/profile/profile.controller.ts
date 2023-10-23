import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) { }

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getMyProfile(@Req() req: Request) {
		const id = req.user.id;
		const profile = await this.profileService.getUserProfileById(id, id)
		if (!profile) {
			return ({ error: `user not found` })
		}
		return (profile);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':nick')
	async getProfile(@Req() req: Request, @Param('nick') nick: string) {
		const id = req.user.id;
		const profile = await this.profileService.getUserProfileByNick(id, nick);
		if (!profile) {
			return ({ error: `user ${nick} not found` })
		}
		return (profile);
	}

	

}