import { Controller, Get, Param } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) { }


	@Get(':nick')
	findAllFriends(@Param('nick') nick: string) {
		return (this.friendsService.findAllFriends(nick))
	}
}
