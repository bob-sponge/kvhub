import { Controller, Get, Post, Param, Body } from '@nestjs/common';
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
    return ResponseBody.okWithData(this.projectService.findAllPorjects());
  }

  @Post('save')
  async addProject(@Body() projectVO: ProjectVO): Promise<ResponseBody> {
    return this.projectService.saveProject(projectVO) ? ResponseBody.ok() : ResponseBody.error();
  }
  @Get('view/:id/:branchId')
  async projectView(@Param('id') id: number, @Param('branchId') branchId: number): Promise<ProjectViewVO[]> {
    return this.projectService.getProjectView(id, branchId);
  }
}
