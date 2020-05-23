import { ExceptionFilter, Catch, BadRequestException, ArgumentsHost } from "@nestjs/common";

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    response.status(exception.status).json({
      statusCode: status,
      message: exception.message,
      success: false,
    });
  }
}