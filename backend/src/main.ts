import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from '../common/filters/entity-not-found-exception.filter';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

async function bootstrap() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new EntityNotFoundExceptionFilter(),
  );
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
