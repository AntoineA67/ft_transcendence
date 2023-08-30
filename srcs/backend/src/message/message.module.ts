import { Module } from '@nestjs/common';
import MessagesController from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageGateway } from './message.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
})
export class MessagesModule { }
