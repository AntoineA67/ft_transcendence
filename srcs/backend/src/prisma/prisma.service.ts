import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			log: [],
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