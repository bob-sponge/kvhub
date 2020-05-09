import { Controller, Get, Param, Body, UsePipes, ValidationPipe, Post, Delete, Logger } from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Page } from 'src/vo/Page';
import { BranchBody } from 'src/vo/BranchBody';
import { CompareVO } from 'src/vo/CompareVO';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  /**
   * 根据projectId查询branch
   * @param projectId projectId
   */
  @Get('/list/:projectId')
  async findListByProjectId(@Param('projectId') projectId: number): Promise<Branch[]> {
    return this.branchService.findBranchByProjectId(projectId);
  }

  /**
   * 分页查询
   */
  @Post('/all')
  @UsePipes(new ValidationPipe())
  async findBranchList(@Body() page: Page): Promise<ResponseBody> {
    if (page.content === '') {
      return ResponseBody.okWithData(await this.branchService.findAllWithPage(page));
    }
    return ResponseBody.okWithData(await this.branchService.findByCondition(page));
  }

  /**
   * 根据id删除branch
   * @param id id
   */
  @Delete('/delete/:id')
  async deleteBranch(@Param('id') id: number): Promise<ResponseBody> {
    await this.branchService.deleteBranch(id);
    return ResponseBody.okWithMsg('delete success');
  }

  /**
   * 新增branch
   * @param branchBody branchBody
   */
  @Post('/save')
  @UsePipes(new ValidationPipe())
  async addBranch(@Body() branchBody: BranchBody): Promise<ResponseBody> {
    await this.branchService.save(branchBody);
    return ResponseBody.okWithMsg('save branch success');
  }

  @Post('/compare')
  async branchCompare(@Body() compareVO: CompareVO): Promise<ResponseBody> {
    await this.branchService.compare(compareVO);
    return ResponseBody.okWithData('');
  }
}
