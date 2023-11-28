import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageGateway } from './message.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [MessagesService, MessageGateway],
})
export class MessagesModule { }
