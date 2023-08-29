import { Module } from '@nestjs/common';
import MessagesController from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
})
export class MessagesModule { }
