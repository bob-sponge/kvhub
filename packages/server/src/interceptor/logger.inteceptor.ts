import { NestInterceptor, ExecutionContext, CallHandler, Logger, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    // print request path
    /* Logger.log(
      ' ================== ' + context.switchToHttp().getRequest().url + ' ================== ',
      'Request Path',
      true,
    ); */
    return next.handle();
  }
}
