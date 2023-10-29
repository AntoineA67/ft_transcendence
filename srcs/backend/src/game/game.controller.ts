import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GamesService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfileService } from 'src/profile/profile.service';
import { Request } from 'express';


@Controller('game')
export class GameController {
  constructor(private readonly gamesService: GamesService, private readonly prisma: PrismaService, private readonly profileService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getMyProfile(@Req() req: Request, @Param('userId') userId: string) {
    // this.logger.log('me')
    const id = req.user.id;
    if (userId === req.user.id.toString()) {
      return "Non"
    }
    const profile = await this.profileService.getUserProfileById(id, id)
    if (!profile) {
      throw new HttpException('User me not found', HttpStatus.NOT_FOUND);
    }
    return profile;
  }

  // @Public()
  // @Get()
  // async getAllGames(): Promise<any> {
  //   return await this.gamesService.findAll();
  // }

  // @Public()
  // @Get('test')
  // getTest() {
  //   return this.prisma.game.findMany();
  // }

  // @Public()
  // @Post()
  // async createGame(
  //   @Body() gameData: any,
  // ): Promise<Game> {
  //   return await this.gamesService.create(gameData);
  // }
}
