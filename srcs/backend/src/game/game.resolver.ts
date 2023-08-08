import 'reflect-metadata'
import {
	Resolver,
	Query,
	Mutation,
	Args,
	Context,
	ResolveField,
	Root,
	InputType,
	Field,
} from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { user } from 'src/prisma/@generated/user/user.model'
import { PrismaService } from 'src/prisma.service'
import { userCreateInput } from 'src/prisma/@generated/user/user-create.input'
import { game } from 'src/prisma/@generated/game/game.model'


@Resolver(game)
export class GameResolver {
	constructor(@Inject(PrismaService) private prismaService: PrismaService) { }

	@Mutation((returns) => game)
	async creategames(
		@Context() ctx,
	): Promise<game> {

		return await this.prismaService.game.create({
			data: {
				start_date: new Date(Date.now()).toISOString(),
			},
		})
	}

	@Query((returns) => [game], { nullable: true })
	async allgames(@Context() ctx) {
		return this.prismaService.game.findMany()
	}
}
