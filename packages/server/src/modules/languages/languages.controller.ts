import { Controller, Get } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from 'src/entities/Language';
import { ResponseBody } from 'src/vo/ResponseBody';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}
  // find all languages
  @Get('all')
  async findAll(): Promise<ResponseBody> {
    return ResponseBody.okWithData(this.languagesService.findAll());
  }
}
