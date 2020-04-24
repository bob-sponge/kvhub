import { Controller, Get, Post, Param, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';
import { ProjectVO } from 'src/vo/PorjectVO';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // find all projects with key and languages
  @Get('all')
  async findAll(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.projectService.findAllPorjects());
  }

  @Post('save')
  @UsePipes(new ValidationPipe())
  async addProject(@Body() projectVO: ProjectVO): Promise<ResponseBody> {
    await this.projectService.saveProject(projectVO);
    return ResponseBody.okWithMsg('save project success');
  }

  @Get('view/:id/:branchId')
  async projectView(@Param('id') id: number, @Param('branchId') branchId: number): Promise<ProjectViewVO[]> {
    return this.projectService.getProjectView(id, branchId);
  }
}
