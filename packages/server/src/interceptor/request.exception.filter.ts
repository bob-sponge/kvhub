import { ExceptionFilter, Catch, BadRequestException, ArgumentsHost, HttpCode, HttpStatus } from '@nestjs/common';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.OK;
    const message = exception.response.message;
    response.status(exception.status).json({
      statusCode: status,
      data: Array.isArray(message) ? message[0] : message,
      success: false,
      timestamp: new Date().valueOf(),
    });
  }
}
