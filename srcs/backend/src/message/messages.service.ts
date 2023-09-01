import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService
  ) { }

  async getAllMessages(): Promise<any> {
    return await this.prisma.message.findMany();
  }

  // async getMessageById(id: number) {
  //   const message = await this.messagesRepository.findOne({
  //     where: {
  //       id: id,
  //     },
  //   });
  //   if (message) {
  //     return message;
  //   }
  //   throw new NotFoundException('Could not find the message');
  // }

  async createMessage(message: string): Promise<any> {
    return await this.prisma.message.create({
      data:
      {
        message: message,
        send_date: new Date(),
      }
    });
  }
}