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

  // @Get(':id')
  // async getMessageById(@Param('id') id: string): Promise<Message> {
  //   const messageId = parseInt(id, 10);
  
  //   const message = await this.messagesService.getMessageById(messageId);
  //   return message;
  // }

  @Post()
  async createMessage(@Body() messageData: Message) {
    if (!messageData.message || !messageData.roomId) {
      throw new Error('Message and roomId are required');
    }
    const newMessage = await this.messagesService.createMessage(messageData.message, messageData.roomId);
    return newMessage;
  }
}
