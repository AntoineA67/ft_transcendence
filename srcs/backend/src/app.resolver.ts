import { Query, Resolver } from '@nestjs/graphql';
// import Message from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';

@Resolver()
export class AppResolver {
	@Query(() => String)
	sayHello(): string {
		return 'Hello World!';
	}
}