import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { FortyTwoStrategy } from './forty-two.strategy';
import { AuthController } from './auth.controller';
import { WsJwtStrategy } from './ws-jwt-auth.strategy';
import { PrismaService } from '../prisma/prisma.service';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: '42' }),
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [PrismaService, FortyTwoStrategy, AuthService, LocalStrategy, JwtStrategy, WsJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
