import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { FortyTwoStrategy } from './strategies/forty-two.strategy';
import { AuthController } from './auth.controller';
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
  providers: [PrismaService, FortyTwoStrategy, AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
