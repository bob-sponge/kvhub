import { Controller, Get, Post, Param, Body, ValidationPipe, UsePipes, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { ProjectVO } from 'src/vo/PorjectVO';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
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
  async projectView(@Param('id') id: number, @Param('branchId') branchId: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.projectService.getProjectView(id, branchId));
  }

  @Get('view/:id')
  async projectInfo(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.projectService.projectInfo(id));
  }
  /**
   * 删除工程接口
   * @url: 192.168.1.247:5000/project/4
   * @method: delete
   * @param id 工程id
   * @return:
   * {
    "statusCode": 0,
    "success": true,
    "timestamp": 1602211114015
    }
   */
  @Delete('/:id')
  async deleteProject(@Param('id') id: number) {
    return ResponseBody.okWithData(await this.projectService.deleteProject(id));
  }
}
