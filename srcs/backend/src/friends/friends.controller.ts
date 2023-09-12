import { Controller, Get, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) { }


	@Get(':nick')
	findAll(@Param('nick') nick: string) {
		return (this.friendsService.findAll(nick))
	}
}
