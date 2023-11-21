import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipGateway } from './friendship.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { BlockModule } from 'src/block/block.module';
import { BlockService } from 'src/block/block.service';

@Module({
  imports: [PrismaModule, UsersModule, BlockModule],
  providers: [ FriendshipService,FriendshipGateway], // Ajoutez la passerelle aux providers
  controllers: [],
  exports: [FriendshipService]
})
export class FriendshipModule {}
