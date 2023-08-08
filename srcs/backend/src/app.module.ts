import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { GameController } from './game/game.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresProviderModule } from './providers/db/provider.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { AppResolver } from './app.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Game } from './entities/game.entity';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GameModule,
    // PrismaModule,
    // TypeOrmModule.forRoot({
    //   entities: [Game]
    // }),
    // PostgresProviderModule,
    // UsersModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      buildSchemaOptions: { dateScalarMode: 'timestamp' },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    // PrismaService,

    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    AppResolver,
  ],
})
export class AppModule { }
