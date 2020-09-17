import { Controller, Get, Session, Body, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { PermissionGuard } from '../../permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';
import { LoginBodyVO } from 'src/vo/LoginBodyVO';

@Controller('user')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/query')
  @Permission('query')
  async queryAll(@Body() body: any): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.userService.query(body));
  }

  @Post('/reset')
  @Permission('reset')
  async reset(@Session() session, @Body() body: any): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.reset(session, body));
  }

  @Delete('/delete/:id')
  @Permission('delete')
  async delete(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.delete(id))
  }

  @Get('/set/:id/:level')
  @Permission('set')
  async set(@Session() session, @Param('id') id: number, @Param('level') level: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.set(session, id, level));
  }

  @Post('/login')
  async login(@Session() session,@Body() loginBodyVO:LoginBodyVO): Promise<ResponseBody> {
    const user = await this.userService.login(loginBodyVO);
    session.user = {
      id: user.id,
      name: user.name,
      admin: user.admin,
      permission: user.permission
    }
    return ResponseBody.okWithMsg('Login success!');
  }

  @Get('/loginout')
  async loginout(@Session() session): Promise<ResponseBody> {
    session.user = {}
    return ResponseBody.okWithMsg('Logout success!');
  }
}
