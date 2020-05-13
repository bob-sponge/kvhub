import { Controller,  Post, Body, Get, Param } from '@nestjs/common';
import { BranchMergeService } from './branchMerge.service';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { ResponseBody } from 'src/vo/ResponseBody';

@Controller('branchMerge')
export class BranchMergeController {
  constructor(private readonly branchMergeService: BranchMergeService) {}
  // find all languages
  @Post('/list')
  async list(@Body() vo:BranchMergeSearchVO): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.list(vo));
  }

  @Get('/info/:id')
  async getInfoById(@Param('id') id:number) : Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.getInfoById(id));
  }

  @Get('/refuse/:id')
  async refuseById(@Param('id') id:number) : Promise<ResponseBody> {
    await this.branchMergeService.refuse(id)
    return ResponseBody.ok();
  }

  @Get('/diff/:mergeId')
  async getDiffById(@Param('mergeId') mergeId:number) : Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.getDiffById(mergeId));
  }

  @Post('/save')
  async save(@Body() vo:BranchMerge) : Promise<ResponseBody> {
    await this.branchMergeService.save(vo);
    return ResponseBody.ok();
  }

  @Get('/diffkey/generate/:mergeId')
  async generateDiffKey(@Param('mergeId') mergeId:number) : Promise<ResponseBody> {
    await this.branchMergeService.generateDiffKey(mergeId);
    return ResponseBody.ok();
  }
}