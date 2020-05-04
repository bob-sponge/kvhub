import { Controller,  Post, Body } from '@nestjs/common';
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
}