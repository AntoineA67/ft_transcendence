import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { BlockService } from './block.service';
import { Block, Prisma } from '@prisma/client';

@Controller('blocks')
export class BlockController {
	constructor(private readonly blockService: BlockService) {}

}
