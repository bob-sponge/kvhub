import { Controller, Get, Param, Body, UsePipes, ValidationPipe, Post, Delete } from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { Page } from 'src/vo/Page';
import { PageSearch } from 'src/vo/PageSearch';
import { BranchBody } from 'src/vo/BranchBody';
import { CompareVO } from 'src/vo/CompareVO';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * 根据projectId查询branch
   * @param projectId projectId
   */
  @Get('/list/:projectId')
  async findListByProjectId(@Param('projectId') projectId: number): Promise<Branch[]> {
    return this.branchService.findBranchByProjectId(projectId);
  }

  /**
   * 分页模糊查询
   * @param pageSearch pageSearch
   */
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
