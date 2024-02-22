import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const ex =
      exception instanceof HttpException
        ? exception
        : new InternalServerErrorException('Что-то пошло не так');
    const httpStatus = ex.getStatus();
    response.status(httpStatus).json({
      message: ex.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
