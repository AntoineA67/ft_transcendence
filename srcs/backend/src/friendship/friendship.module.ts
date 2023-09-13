import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipGateway } from './friendship.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FriendshipService, FriendshipGateway], // Ajoutez la passerelle aux providers
  controllers: [FriendshipController],
})
export class FriendshipModule {}
