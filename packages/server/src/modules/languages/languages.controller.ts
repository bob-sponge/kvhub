import { Controller, Get } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from 'src/entities/Language';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}
  // find all languages
  @Get('all')
  async findAll(): Promise<Language[]> {
    return this.languagesService.findAll();
  }
}
