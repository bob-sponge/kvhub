import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ProjectLanguageService } from './projectLanguage.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';

@Controller('projectLanguage')
@UseGuards(PermissionGuard)
export class ProjectLanguageController {
  constructor(private readonly projectLanguageService: ProjectLanguageService) {}

  /**
   * delete project language
   * @param id
   */
  @Get('/delete/:id')
  @Permission('delete')
  async deleteProjectLanguage(@Param('id') id: number): Promise<ResponseBody> {
    await this.projectLanguageService.delete(id);
    return ResponseBody.okWithMsg('delete success!');
  }

  @Post('save')
  async saveProjectLanguage(@Body() vo: ProjectLanguage): Promise<ResponseBody> {
    await this.projectLanguageService.save(vo);
    return ResponseBody.ok();
  }
}
