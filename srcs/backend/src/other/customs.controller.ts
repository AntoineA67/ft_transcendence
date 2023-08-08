import { Controller, Get, Post, Body } from '@nestjs/common';
import { CustomService } from './customs.service';

@Controller('customs')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  create(@Body() data: any) {
    return this.customService.create(data);
  }

  @Get()
  findAll() {
    return this.customService.findAll();
  }
}
