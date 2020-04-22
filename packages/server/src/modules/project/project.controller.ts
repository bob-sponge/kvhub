import { Controller, Get, Param } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Dashboard } from 'src/vo/Dashboard';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // find all projects with key and languages
  @Get('all')
  async findAll(): Promise<Dashboard[]> {
    return this.projectService.findAllPorjects();
  }
  @Get('view/:id/:branchId')
  async projectView(@Param('id') id:number, @Param('branchId') branchId:number): Promise<ProjectViewVO[]> {
    return this.projectService.getProjectView(id,branchId);
  }
}
