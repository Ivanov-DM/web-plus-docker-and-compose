import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get()
  getUser(): string {
    return 'Hello world';
  }
}
