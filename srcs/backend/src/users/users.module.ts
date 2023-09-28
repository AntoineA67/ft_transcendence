import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';
import { FriendshipService } from 'src/friendship/friendship.service';
import { BlockService } from 'src/block/block.service';

@Module({
  providers: [UsersService, UsersGateway, FriendshipService, BlockService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule { }
