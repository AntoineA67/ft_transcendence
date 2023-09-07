import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
// import { GameModule } from './game/game.module';
// import { GameController } from './game/game.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
// import { AppResolver } from './app.resolver';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { MessagesModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // GameModule,
    MessagesModule,
    UsersModule, // Inclus ici

    AuthModule,
    DevtoolsModule.register({
      port: 3001,
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // AppResolver,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule { }
