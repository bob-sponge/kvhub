import {
  Controller,
  Get,
  Session,
  Body,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  Response,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { PermissionGuard } from '../../permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';
import { LoginBodyVO } from 'src/vo/LoginBodyVO';
import { ErrorMessage, PermissionCtl } from 'src/constant/constant';

@Controller('user')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/query')
  async queryAll(@Body() body: any): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.userService.query(body));
  }

  @Get('/query/:id')
  async queryById(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.userService.queryById(id));
  }

  @Post('/reset')
  async reset(@Session() session, @Body() body: any, @Request() req): Promise<ResponseBody> {
    const admin: number = Number.parseInt(req.cookies.admin);
    const result = await this.userService.reset(admin, body);
    return ResponseBody.okWithMsg(result);
  }

  @Post('/reset/oneuser')
  @Permission(PermissionCtl.EDIT_PASSWORD)
  async resetoneuser(@Session() session, @Body() body: any, @Request() req): Promise<ResponseBody> {
    const admin: number = Number.parseInt(req.cookies.admin);
    const result = await this.userService.resetoneuser(admin, body);
    return ResponseBody.okWithMsg(result);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.delete(id));
  }

  @Get('/set/:id/:level')
  async set(
    @Session() session,
    @Param('id') id: number,
    @Param('level') level: number,
    @Request() req,
  ): Promise<ResponseBody> {
    const admin: number = Number.parseInt(req.cookies.admin);
    const result = await this.userService.set(admin, id, level);
    return ResponseBody.okWithMsg(result);
  }

  @Post('/login')
  async login(@Session() session, @Response() res, @Body() loginBodyVO: LoginBodyVO): Promise<ResponseBody> {
    const user = await this.userService.login(loginBodyVO);
    // const uuid = UUIDUtils.generateUUID();
    res.cookie('token', loginBodyVO.loginName, { maxAge: 3600000 });
    res.cookie('permission', user.permission);
    res.cookie('admin', user.admin);
    user.password = null;
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    return res.send(JSON.stringify(ResponseBody.okWithData(user)));
  }

  @Get('/logout')
  async logout(@Request() req, @Response() res): Promise<ResponseBody> {
    if (
      req.cookies === null ||
      req.cookies === undefined ||
      req.cookies.token === null ||
      req.cookies.token === undefined
    ) {
      throw new BadRequestException(ErrorMessage.PLEASE_LOGIN_FIRST);
    }
    req.session.cookie.maxAge = 0;
    res.cookie('token', null, { maxAge: 0 });
    res.cookie('permission', null);
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    return res.send(JSON.stringify(ResponseBody.okWithMsg('Logout success!')));
  }
}
