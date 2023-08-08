import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../typeorm/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async getAllMessages(): Promise<Message[]> {
    return await this.messagesRepository.find();
  }

  async getMessageById(id: number) {
    const message = await this.messagesRepository.findOne({
      where: {
        id: id,
      },
    });
    if (message) {
      return message;
    }
    throw new NotFoundException('Could not find the message');
  }

  async createMessage(messageData: Message): Promise<Message> {
    return await this.messagesRepository.save(messageData);
  }
}
