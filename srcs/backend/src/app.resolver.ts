import { Query, Resolver } from '@nestjs/graphql';
import Message from './typeorm/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './typeorm/game.entity';

@Resolver()
export class AppResolver {
	@Query(() => String)
	sayHello(): string {
		return 'Hello World!';
	}
}