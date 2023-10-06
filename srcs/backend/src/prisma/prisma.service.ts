import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// ???
const prisma = new PrismaClient()

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			log: [],
			// log: ["error", "info", "query", "warn"],
		});
	}

	async onModuleInit() {
		console.log('PrismaService init');
		await this.$connect().then(() => {
			console.log('PrismaService connected')
		});
	}
	async onModuleDestroy() {
		await this.$disconnect().then(() => {
			console.log('PrismaService disconnected');
		});
	}
}