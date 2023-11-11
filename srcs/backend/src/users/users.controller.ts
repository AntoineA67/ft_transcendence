import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
// import { FortyTwoAuthGuard } from 'src/auth/guards/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { Express } from 'express'
// import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Controller('api/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: Request) {
        return req.user;
    }

	@UseGuards(JwtAuthGuard)
	@Get('all')
	async getAll(@Req() req: Request) {
		return await this.usersService.getAllUsers();
	}
	
}