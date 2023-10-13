import { Body, Controller, Get, Param, Post, UseGuards, Patch, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from './profile.service';
import { Request } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) { }

	// @UseGuards(JwtAuthGuard)
	@Get('me')
	async getMyProfile(@Request() req) {
		return await (this.profileService.getUserProfileById(req.user.id , req.user.id));
	}
	
	// @UseGuards(JwtAuthGuard)
	@Get(':nick')
	async getProfile(@Request() req, @Param() params: any) {
		return await (this.profileService.getUserProfileByNick(req.user.id, params.nick))
	}
}