import { Controller, Get } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Dashboard } from 'src/vo/Dashboard';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // find all projects with key and languages
  @Get('all')
  async findAll(): Promise<Dashboard[]> {
    return this.projectService.findAllPorjects();
  }
}
