import { Controller, Get, Req, UseGuards, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('api/profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {
	}

	private logger = new Logger('profile');

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async getMyProfile(@Req() req: Request) {
		const id = req.user.id;
		const profile = await this.profileService.getUserProfileById(id, id)
		if (!profile) {
			throw new HttpException('User me not found', HttpStatus.NOT_FOUND);
		}
		return (profile);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':nick')
	async getProfile(@Req() req: Request, @Param('nick') nick: string) {
		const id = req.user.id;
		const profile = await this.profileService.getUserProfileByNick(id, nick);
		if (!profile) {
			throw new HttpException(`User ${nick} not found`, HttpStatus.NOT_FOUND);
		}
		return (profile);
	}

	@Get('test')
	getTest() {
		return ('test');
	}

	

}