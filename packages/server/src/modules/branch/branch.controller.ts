import { Controller, Get, Param, Body, UsePipes, ValidationPipe, Post, Delete, Logger, UseInterceptors } from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { BranchVO } from 'src/vo/BranchVO';
import { Page } from 'src/vo/Page';
import { PageSearch } from 'src/vo/PageSearch';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  @Get('/list/:projectId')
  async findListByProjectId(@Param('projectId') projectId: number): Promise<Branch[]> {
    return this.branchService.findBranchByProjectId(projectId);
  }

  @Post('/find')
  async findBranchByCondition(@Body() pageSearch: PageSearch): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchService.findByCondition(pageSearch));
  }

  /**
   * 分页查询
   */
  @Post('/all')
  @UsePipes(new ValidationPipe())
  async findBranchList(@Body() page: Page): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchService.findAllWithPage(page));
  }

  @Delete('/delete/:id')
  async deleteBranch(@Param('id') id: number): Promise<ResponseBody> {
    await this.branchService.deleteBranch(id);
    return ResponseBody.okWithMsg('delete success');
  }

  @Post('/save')
  @UsePipes(new ValidationPipe())
  async addBranch(@Body() branchVO: BranchVO): Promise<ResponseBody> {
    await this.branchService.save(branchVO);
    return ResponseBody.okWithMsg('save branch success');
  }
}
