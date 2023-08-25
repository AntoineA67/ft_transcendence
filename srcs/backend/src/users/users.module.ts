import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  // controllers: [UsersController],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule { }
