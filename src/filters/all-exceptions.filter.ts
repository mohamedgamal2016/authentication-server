import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const message = exception.getResponse() as {
      key: string;
      args: Record<string, unknown>;
      message: string;
    };

    this.logger.error(
      `An error has been encountered while processing application code. Please check the recent log for proper trace. Status code = ${statusCode}, message = ${JSON.stringify(
        message,
      )}`,
    );
    this.logger.debug(
      `Exception encountered in application code = ${exception.name}, Stack trace = ${exception.stack}`,
    );

    response.status(statusCode).json({
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    });
  }
}
