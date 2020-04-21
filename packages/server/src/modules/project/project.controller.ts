import { Controller, Get, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ResponseBody } from 'src/vo/ResponseBody';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  // find all projects with key and languages
  @Get('all')
  async findAll(): Promise<ResponseBody> {
    return ResponseBody.okWithData(this.projectService.findAllPorjects());
  }

  @Post('save')
  async addProject(): Promise<ResponseBody> {
    return ResponseBody.ok();
  }
}
