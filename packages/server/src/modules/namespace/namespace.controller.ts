import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResponseBody } from 'src/vo/ResponseBody';
import { NamespaceService } from './namespace.service';
import { Namespace } from 'src/entities/Namespace';

@Controller('namespace')
export class NamespaceController {
  constructor(private readonly namespaceService: NamespaceService) {}

  @Post('/save')
  async save(@Body() vo:Namespace): Promise<ResponseBody> {
    await this.namespaceService.save(vo);
    return ResponseBody.ok();
  }
}
