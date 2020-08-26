import { Controller, Get, Request, Session, Response, BadRequestException, Body, Post, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseBody } from 'src/vo/ResponseBody';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/query')
  async queryAll(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.userService.query());
  }

  @Post('/reset')
  async reset(@Session() session, @Body() body: any): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.reset(session, body));
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.delete(id))
  }

  @Get('/admin/:id')
  async setAsAdmin(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithMsg(await this.userService.setAsAdmin(id));
  }
}
