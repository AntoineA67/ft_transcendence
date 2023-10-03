import { Body, Controller, Get, Param, Post, UseGuards, Patch, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { User, UsersService } from './users.service';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	// @Get()
	// async getUsers() {
	// 	return await (this.usersService.getAllUsers());
	// }
	
	

	// @Get(':nick')
	// async getUser(@Param('nick') nick: string): Promise<any> {
	// 	// return ('wtf')
	// 	let res: any;
	// 	try {
	// 		res =  await (this.usersService.getUserByNick(nick));
	// 	} catch (err: any) {
	// 		return ('wtf');
	// 	}
	// 	return (res);
	// }
}