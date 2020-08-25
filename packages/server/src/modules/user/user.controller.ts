import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseBody } from 'src/vo/ResponseBody';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/query')
  async queryAll(): Promise<ResponseBody>{
    return ResponseBody.okWithData(await this.userService.query());
  }
}
