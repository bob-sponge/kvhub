import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { User } from "src/entities/User";
import { ErrorMessage } from "src/constant/constant";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>('permission', context.getHandler());
    // 无权限要求的请求直接放行
    if (!permissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.session.user;
    if (user == null) {
      throw new UnauthorizedException(ErrorMessage.PLEASE_LOGIN_FIRST);
    }
    let pers: string[] = [];
    if (user.permission.indexOf(',') == -1) {
      pers = Array.of(user.permission);
    } else {
      pers = user.permission.split(',');
    }
    let hadPermission = () => pers.some((x) => permissions.includes(x));
    if (user != null && hadPermission()) {
      return true;
    } else {
      throw new UnauthorizedException(ErrorMessage.NO_PERMISSION);
    }
  }
}