import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

function GpcToHttp(code: number): number {
  if (code == 6) return 403; // already exists - ko co quyen truy cap
  if (code == 5) return 404; // not found
  if (code == 2) return 400; // unknow - badrequest
  if (code == 3) return 403; // doi so k hop le  - ko co quyen truy cap
  return 500;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.code
        ? GpcToHttp(exception.code)
        : 500;

    response.status(status).json({
      statusCode: status,
      message: exception.details || exception.message || 'unknown',
      grpcStatusCode: exception.code || 2,
      path: request.url,
    });
  }
}
