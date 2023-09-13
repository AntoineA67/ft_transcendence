import { Module } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { FriendRequestController } from './friendrequest.controller';
import { FriendRequestGateway } from './friendrequest.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { BlockModule } from 'src/block/block.module';
import { BlockService } from 'src/block/block.service';
import { FriendshipService } from 'src/friendship/friendship.service';

@Module({
	imports: [PrismaModule, UsersModule, BlockModule],
	providers: [FriendRequestService, BlockService, FriendshipService, FriendRequestGateway],
	controllers: [FriendRequestController],
})
export class FriendRequestModule {}
