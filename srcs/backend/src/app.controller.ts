
import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Public } from './auth/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private readonly prisma: PrismaService, private readonly appService: AppService, private readonly usersService: UsersService) { }

  @Public()
  @Get('api')
  getHello(): string {
    return 'Hello World';
  }
}
