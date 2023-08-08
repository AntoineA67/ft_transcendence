import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			log: ["error", "info", "query", "warn"],
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



// import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common'
// import { PrismaClient } from '@prisma/client'

// @Injectable()
// export class PrismaService extends PrismaClient
// 	implements OnModuleInit {

// 	async onModuleInit() {
// 		await this.$connect();
// 	}

// 	async enableShutdownHooks(app: INestApplication) {
// 		// this.$on('beforeExit', async () => {
// 		// 	await app.close();
// 		// });
// 	}
// }
