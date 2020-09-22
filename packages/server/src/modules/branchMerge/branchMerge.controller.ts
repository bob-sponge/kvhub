import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { BranchMergeService } from './branchMerge.service';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeSubmitVO } from 'src/vo/BranchMergeSubmitVO';
import { ResponseBody } from 'src/vo/ResponseBody';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';

@Controller('branchMerge')
@UseGuards(PermissionGuard)
export class BranchMergeController {
  constructor(private readonly branchMergeService: BranchMergeService) {}
  // find all languages
  @Post('/list')
  async list(@Body() vo: BranchMergeSearchVO): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.list(vo));
  }

  @Get('/info/:id')
  async getInfoById(@Param('id') id: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.getInfoById(id));
  }

  @Get('/refuse/:id')
  async refuseById(@Param('id') id: number): Promise<ResponseBody> {
    await this.branchMergeService.refuse(id);
    return ResponseBody.ok();
  }

  @Get('/diff/:mergeId')
  async getDiffById(@Param('mergeId') mergeId: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.getDiffById(mergeId));
  }

  @Post('/save')
  async save(@Body() vo: BranchMerge): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.save(vo));
  }

  @Get('/diffkey/generate/:mergeId')
  async generateDiffKey(@Param('mergeId') mergeId: number): Promise<ResponseBody> {
    await this.branchMergeService.generateDiffKey(mergeId);
    return ResponseBody.ok();
  }

  @Post('/merge')
  @Permission('merge')
  async merge(@Body() vo: BranchMergeSubmitVO): Promise<ResponseBody> {
    await this.branchMergeService.merge(vo);
    return ResponseBody.ok();
  }
}
