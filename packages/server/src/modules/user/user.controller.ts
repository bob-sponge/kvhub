import { Controller, Get, Session, Body, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { PermissionGuard } from '../../permission/permission.guard'
import { Permission } from 'src/permission/permission.decorator';

@Controller('user')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/query')
  @Permission('query')
  async queryAll(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.userService.query());
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

  @Get('/admin/:id')
  @Permission('set')
  async setAsAdmin(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.setAsAdmin(id));
  }
}
