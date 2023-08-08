// import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { Module } from "@nestjs/common"
// import { Prisma, PrismaClient } from "@prisma/client"

@Module({
	providers: [PrismaService],
	exports: [PrismaService],

})
export class PrismaModule { }

// const prisma = new PrismaClient()

// const prismaProvider = {
// 	provide: "Prisma",
// 	useFactory: () => () => prisma,
// }
// @Module({
// 	providers: [prismaProvider],
// 	exports: [prismaProvider],
// })
// export class PrismaModule { }