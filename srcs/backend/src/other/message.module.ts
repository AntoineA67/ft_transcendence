import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
})
export class MessagesModule { }
