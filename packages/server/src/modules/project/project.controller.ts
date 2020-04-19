import { Controller, Get } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // find all projects
  @Get('all')
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }
}
