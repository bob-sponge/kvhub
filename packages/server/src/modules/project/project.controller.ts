import { Controller, Get, Post, Param, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';
import { ProjectVO } from 'src/vo/PorjectVO';
import { Project } from 'src/entities/Project';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }
  /**
   * find all projects with key and languages
   */
  @Get('dashboard/all')
  async findAllDashboardProjects(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.projectService.dashboardPorjects());
  }

  /**
   * find all projects
   */
  @Get('all')
  async findAllProjects(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.projectService.allProjects());
  }

  @Post('dashboard/save')
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
