// import { Resolver, Args, Int, ResolveField, Parent, Mutation, Query } from "@nestjs/graphql";
// import { UsersService } from "./users.service";
// import { User } from "src/entities/user.entity";

// @Resolver(() => Game)
// export class GameResolver {
// 	constructor(private readonly usersService: UsersService) { }

// 	@Mutation(() => Game, { name: 'createGame' })
// 	createGame() {
// 		return this.usersService.create();
// 	}

// 	@Query(() => [Game])
// 	async games() {
// 		return this.usersService.findAll();
// 	}

// 	@Query(() => Game)
// 	async game(@Args('id', { type: () => Int }) id: number) {
// 		return this.usersService.find(id);
// 	}
// }
