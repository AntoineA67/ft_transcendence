import { Body, Controller, Get, Param, Post, UseGuards, Patch, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { User, UsersService } from './users.service';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	private logger = new Logger('users');

	@Post('newAvatar')
	@UseInterceptors(FileInterceptor('avatar'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
	}
}