
import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Public } from './auth/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private readonly prisma: PrismaService, private readonly appService: AppService) { }

  @Public()
  @Get('api')
  getHello(): string {
    return 'Hello World Controller';
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Public()
  @Get('test')
  getTest() {
    return this.prisma.game.findMany();
  }
  @Public()
  @Get('test2')
  getTest2() {
    return this.appService.getPrismaTest();
  }
}
