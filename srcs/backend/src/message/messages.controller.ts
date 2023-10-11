import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessagesService } from './messages.service';

@Controller('messages')
export default class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Get()
  async getAllMessages(): Promise<Message[]> {
    return await this.messagesService.getAllMessages();
  }
}
