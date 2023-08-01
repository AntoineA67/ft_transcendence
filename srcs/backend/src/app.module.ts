import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './message/message.module';
import { MessagesController } from './message/messages.controller';
import { MessagesService } from './message/messages.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresProviderModule } from './providers/db/provider.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    MessagesModule,
    PostgresProviderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }