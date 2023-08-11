import { Module } from '@nestjs/common';
import { UserFriendshipLinkGateway } from './user-friendship-link.gateway';
import { UserFriendshipLinkService } from './user-friendship-links.service';
import { UserFriendshipLinkController } from './user-friendship-links.controller';

@Module({
  providers: [UserFriendshipLinkGateway, UserFriendshipLinkService],
  controllers: [UserFriendshipLinkController],
})
export class UserFriendshipLinkModule {}
