import { Controller, Get, Param} from '@nestjs/common';
import { ProjectLanguageService } from './projectLanguage.service';
import { ResponseBody } from 'src/vo/ResponseBody';

@Controller('projectLanguage')
export class ProjectLanguageController {
  constructor(private readonly projectLanguageService: ProjectLanguageService) {}

  /**
   * delete project language
   * @param id 
   */
  @Get('/delete/:id')
  async deleteProjectLanguage(@Param('id') id: number): Promise<ResponseBody> {
    await this.projectLanguageService.delete(id)
    return ResponseBody.okWithMsg('delete success!');
  }
}
