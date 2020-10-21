import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProjectLanguageService } from './projectLanguage.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';
import { PermissionCtl } from 'src/constant/constant';
import * as Log4js from 'log4js';

@Controller('projectLanguage')
@UseGuards(PermissionGuard)
export class ProjectLanguageController {
  logger = Log4js.getLogger();
  constructor(private readonly projectLanguageService: ProjectLanguageService) {
    this.logger.level = 'info';
  }

  /**
   * delete project language
   * @param id
   */
  @Get('/delete/:id')
  @Permission(PermissionCtl.DELETE_PROJECT_LANGUAGE)
  async deleteProjectLanguage(@Param('id') id: number, @Request() req): Promise<ResponseBody> {
    const currentUser = req.cookies.token;
    await this.projectLanguageService.delete(id, currentUser);
    this.logger.info(`user ${currentUser} delete project language id ${id}.`);
    return ResponseBody.okWithMsg('delete success!');
  }

  @Post('save')
  async saveProjectLanguage(@Body() vo: ProjectLanguage): Promise<ResponseBody> {
    await this.projectLanguageService.save(vo);
    return ResponseBody.ok();
  }
}
