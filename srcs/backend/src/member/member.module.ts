import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberGateway } from './member.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomService } from 'src/room/room.service';
import { RoomModule } from 'src/room/room.module';

@Module({
	imports: [PrismaModule, RoomModule],
	providers: [MemberService, MemberGateway, RoomService],
	controllers: [MemberController],
  })
  export class MemberModule {}
  
