import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMessages(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async createMessage(messageContent: string, roomId: number, userid: number): Promise<Message> {
    return this.prisma.message.create({
      data: {
        message: messageContent,
        send_date: new Date(),
        room: { connect: { id: roomId } },
        user: { connect: { id: userid } },
      },
    });
  }

}
