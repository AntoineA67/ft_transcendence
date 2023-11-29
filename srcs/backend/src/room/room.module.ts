import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [RoomService, RoomGateway, UsersService],
  controllers: [RoomController],
})
export class RoomModule {}
