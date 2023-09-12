import { Controller, Get } from '@nestjs/common';

@Controller('friends')
export class FriendsController {

	@Get()
	findAll() {
		return ('every friends')
	}
}
