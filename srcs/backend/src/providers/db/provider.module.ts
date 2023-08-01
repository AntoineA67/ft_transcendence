import { Module } from '@nestjs/common';
import entities from '../../typeorm';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('POSTGRES_HOST'),
				port: +configService.get<number>('POSTGRES_PORT'),
				username: configService.get('POSTGRES_USERNAME'),
				password: configService.get('POSTGRES_PASSWORD'),
				database: configService.get('POSTGRES_NAME'),
				entities: entities,
				synchronize: true,
			}),
			inject: [ConfigService],
		} as TypeOrmModuleAsyncOptions),
	],
})
export class PostgresProviderModule { }