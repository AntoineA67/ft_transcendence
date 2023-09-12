import { Module } from '@nestjs/common';
import { FriendRequestService } from './friendrequest.service';
import { FriendRequestController } from './friendrequest.controller';
import { FriendRequestGateway } from './friendrequest.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FriendRequestService, FriendRequestGateway],
  controllers: [FriendRequestController],
})
export class FriendRequestModule {}
