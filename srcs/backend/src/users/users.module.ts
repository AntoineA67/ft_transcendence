import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';

@Module({
	imports: [PrismaModule],
	providers: [UsersService, UsersGateway],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule { }
