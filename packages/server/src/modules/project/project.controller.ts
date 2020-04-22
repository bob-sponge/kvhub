import { Controller, Get, Post, Param} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Dashboard } from 'src/vo/Dashboard';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';

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
  @Get('view/:id/:branchId')
  async projectView(@Param('id') id:number, @Param('branchId') branchId:number): Promise<ProjectViewVO[]> {
    return this.projectService.getProjectView(id,branchId);
  }
}
