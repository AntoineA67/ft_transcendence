import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberGateway } from './member.gateway'; // Importez la passerelle
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MemberService, MemberGateway], // Ajoutez la passerelle aux providers
  controllers: [MemberController],
})
export class MemberModule {}
