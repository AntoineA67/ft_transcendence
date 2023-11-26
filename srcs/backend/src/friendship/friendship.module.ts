import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipGateway } from './friendship.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { BlockModule } from 'src/block/block.module';

@Module({
  imports: [PrismaModule, UsersModule, BlockModule],
  providers: [ FriendshipService,FriendshipGateway],
  controllers: [],
  exports: [FriendshipService]
})
export class FriendshipModule {}
