import { NestInterceptor, ExecutionContext, CallHandler, Logger, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorMessage } from 'src/constant/constant';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class SessionCheckInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const url = context.switchToHttp().getRequest().url;
    if ('/user/login' === url || url.includes('/namespace/json/project/')) {
      return next.handle();
    } else {
      if (
        context.switchToHttp().getRequest().cookies == null ||
        context.switchToHttp().getRequest().cookies === undefined ||
        context.switchToHttp().getRequest().cookies.token === null ||
        context.switchToHttp().getRequest().cookies.token === undefined
      ) {
        throw new BadRequestException(ErrorMessage.PLEASE_LOGIN_FIRST);
      }
    }
    return next.handle();
  }
}
