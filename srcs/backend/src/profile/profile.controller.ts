import { Body, Controller, Get, Param, Post, UseGuards, Patch, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/forty-two-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) { }

	@Get()
	async getMyProfile() {
		return await (this.profileService.getUserProfileById(1, 1));
	}



	@Get(':nick')
	async getProfile(@Param('nick') nick: string) {
	
	}
}