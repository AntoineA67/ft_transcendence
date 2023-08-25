import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import { Message } from '../entities/message.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export default class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  // @Get()
  // async getAllMessages(): Promise<Message[]> {
  //   return await this.messagesService.getAllMessages();
  // }

  // @Get(':id')
  // async getMessageById(@Param('id') id: number): Promise<Message> {
  //   const message = await this.messagesService.getMessageById(id);
  //   return message;
  // }

  // @Post()
  // async createMessage(@Body() messageData: Message) {
  //   if (!messageData.message || !messageData.send_date) {
  //     throw new Error('Message and send_date are required');
  //   }
  //   const newMessage = await this.messagesService.createMessage(messageData);
  //   return newMessage;
  // }
}
