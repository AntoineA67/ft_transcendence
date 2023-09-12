import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMessages(): Promise<any[]> {
    return this.prisma.message.findMany();
  }

  async getMessageById(id: number): Promise<any> {
    const message = await this.prisma.message.findUnique({
      where: {
        id,
      },
    });

    if (message) {
      return message;
    }

    throw new NotFoundException('Could not find the message');
  }

  async createMessage(messageContent: string, roomId: bigint): Promise<any> {
    return this.prisma.message.create({
      data: {
        message: messageContent,
        send_date: new Date(),
        room: { connect: { id: roomId } }
      },
    });
  }

  async updateMessage(id: number, messageContent: string): Promise<any> {
    const existingMessage = await this.getMessageById(id);

    return this.prisma.message.update({
      where: {
        id,
      },
      data: {
        message: messageContent,
      },
    });
  }

  async deleteMessage(id: number): Promise<void> {
    const existingMessage = await this.getMessageById(id);

    await this.prisma.message.delete({
      where: {
        id,
      },
    });
  }
}
