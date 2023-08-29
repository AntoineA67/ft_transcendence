
import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './auth/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private readonly prisma: PrismaService, private readonly appService: AppService) { }

  @Public()
  @Get('/')
  getHello(): string {
    return 'Hello World Controller';
  }

  // Must be public before localAuthGuard to allow login
  // @Public()
  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

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
