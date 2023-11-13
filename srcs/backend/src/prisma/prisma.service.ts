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
		await this.$connect().then(() => {
		});
	}
	async onModuleDestroy() {
		await this.$disconnect().then(() => {
		});
	}
}