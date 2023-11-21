import { Module } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { FriendRequestGateway } from './friendrequest.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { BlockModule } from 'src/block/block.module';
import { FriendshipModule } from 'src/friendship/friendship.module';

@Module({
	imports: [PrismaModule, UsersModule, BlockModule, FriendshipModule],
	providers: [FriendRequestService, FriendRequestGateway],
	controllers: [],
	exports: [FriendRequestService],
})
export class FriendRequestModule {}
