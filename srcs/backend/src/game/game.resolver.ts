// import 'reflect-metadata'
// import {
// 	Resolver,
// 	Query,
// 	Mutation,
// 	Context,
// } from '@nestjs/graphql'
// import { Inject } from '@nestjs/common'
// import { PrismaService } from 'src/prisma/prisma.service'
// import { game as Game } from 'src/prisma/@generated/game/game.model'


// @Resolver(Game)
// export class GameResolver {
// 	constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

// 	@Mutation((returns) => Game)
// 	async creategames(
// 		@Context() ctx,
// 	): Promise<Game> {

// 		return await this.prismaService.game.create({
// 			data: {
// 				start_date: new Date().toISOString(),
// 			},
// 		})
// 	}

// 	@Query((returns) => [Game], { nullable: true })
// 	async allgames(@Context() ctx) {
// 		return this.prismaService.game.findMany()
// 	}
// }
