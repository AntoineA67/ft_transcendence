import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberGateway } from './member.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomService } from 'src/room/room.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [MemberService, MemberGateway, RoomService], // Ajoutez la passerelle aux providers
  controllers: [],
})
export class MemberModule {}
