import { Resolver, Args, Int, ResolveField, Parent, Mutation, Query } from "@nestjs/graphql";
import { GamesService } from "./game.service";
import { Game } from "src/typeorm/game.entity";

@Resolver(() => Game)
export class GameResolver {
	constructor(private readonly gamesService: GamesService) { }

	@Mutation(() => Game, { name: 'createGame' })
	createGame(@Args('name') name: string) {
		return this.gamesService.create(name);
	}

	@Query(() => [Game])
	async games() {
		return this.gamesService.findAll();
	}

	@Query(() => Game)
	async game(@Args('id', { type: () => Int }) id: number) {
		return this.gamesService.find(id);
	}
}
