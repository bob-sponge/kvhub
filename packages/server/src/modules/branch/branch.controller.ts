import { Controller, Get, Param, Body, UsePipes, ValidationPipe, Post } from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { BranchVO } from 'src/vo/BranchVO';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get('/list/:projectId')
  async findListByProjectId(@Param('projectId') projectId: number): Promise<Branch[]> {
    return this.branchService.findBranchByProjectId(projectId);
  }

  @Get('/list')
  async findList(): Promise<Branch[]> {
    return await this.branchService.findAll();
  }

  @Post('save')
  @UsePipes(new ValidationPipe())
  async addBranch(@Body() branchVO: BranchVO): Promise<ResponseBody> {
    await this.branchService.save(branchVO);
    return ResponseBody.okWithMsg('save branch success');
  }
}
