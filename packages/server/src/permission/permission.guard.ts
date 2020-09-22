import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/entities/User';
import { ErrorMessage } from 'src/constant/constant';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>('permission', context.getHandler());
    // 无权限要求的请求直接放行
    if (!permissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const permission: string = request.cookies.permission;
    const admin: string = request.cookies.admin;
    if (admin === '0') {
      // 管理员直接放行
      return true;
    }
    if (permission == null) {
      throw new UnauthorizedException(ErrorMessage.PLEASE_LOGIN_FIRST);
    }
    let pers: string[] = [];
    if (permission.indexOf(',') === -1) {
      pers = Array.of(permission);
    } else {
      pers = permission.split(',');
    }
    let hadPermission = () => pers.some(x => permissions.includes(x));
    if (permission != null && hadPermission()) {
      return true;
    } else {
      throw new UnauthorizedException(ErrorMessage.NO_PERMISSION);
    }
  }
}
