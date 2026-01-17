import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        code = responseObj.code || code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log technical details server-side
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Return user-friendly error response
    const errorResponse: ApiErrorResponse = {
      error: {
        message: this.getUserFriendlyMessage(message, code),
        code,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getUserFriendlyMessage(message: string | string[], code: string): string {
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    // Map common error codes to user-friendly messages
    const friendlyMessages: Record<string, string> = {
      NOT_FOUND: 'The requested resource was not found',
      CONFLICT: 'The resource has been modified by another user. Please refresh and try again.',
      BAD_REQUEST: 'Invalid request. Please check your input and try again.',
      UNAUTHORIZED: 'Authentication required',
      FORBIDDEN: 'You do not have permission to perform this action',
    };

    return friendlyMessages[code] || message || 'An unexpected error occurred';
  }
}
