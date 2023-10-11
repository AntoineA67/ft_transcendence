import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesService } from 'src/message/messages.service';
import { UsersModule } from 'src/users/users.module';
import { BlockService } from 'src/block/block.service';
import { UsersService } from 'src/users/users.service';
import { MemberService } from 'src/member/member.service';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [RoomService, RoomGateway, MessagesService, UsersService, MemberService],
  controllers: [RoomController],
})
export class RoomModule {}
