import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Message } from '../typeorm/message.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class GameController {
  constructor(private readonly messagesService: GameService) { }

  @Get()
  async getAllMessages(): Promise<Message[]> {
    const messages = await this.messagesService.getAllMessages();
    return messages;
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string): Promise<Message> {
    const message = await this.messagesService.getMessageById(Number(id));
    return message;
  }

  @Post()
  async createMessage(@Body('content') content: string) {
    if (!content) {
      throw new Error('Content is required');
    }
    const newMessage = await this.messagesService.createMessage(content);
    return newMessage;
  }
}
