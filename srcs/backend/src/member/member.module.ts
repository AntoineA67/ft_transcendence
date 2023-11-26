import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberGateway } from './member.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomService } from 'src/room/room.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [MemberService, MemberGateway, RoomService],
  controllers: [MemberController],
})
export class MemberModule {}
