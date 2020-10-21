import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BranchMergeService } from './branchMerge.service';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeSubmitVO } from 'src/vo/BranchMergeSubmitVO';
import { ResponseBody } from 'src/vo/ResponseBody';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';
import { PermissionCtl } from 'src/constant/constant';
import * as Log4js from 'log4js';

@Controller('branchMerge')
@UseGuards(PermissionGuard)
export class BranchMergeController {
  logger = Log4js.getLogger();
  constructor(private readonly branchMergeService: BranchMergeService) {
    this.logger.level = 'info';
  }
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
  async refuseById(@Param('id') id: number, @Request() req): Promise<ResponseBody> {
    const currentUser = req.cookies.token;
    await this.branchMergeService.refuse(id);
    this.logger.info(`user ${currentUser} refuse merge, merge id: ${id}.`);
    return ResponseBody.ok();
  }

  @Get('/diff/:mergeId')
  @Permission(PermissionCtl.MERGE_BRANCH)
  async getDiffById(@Param('mergeId') mergeId: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchMergeService.getDiffById(mergeId));
  }

  @Post('/save')
  @Permission(PermissionCtl.MERGE_BRANCH)
  async save(@Body() vo: BranchMerge, @Request() req): Promise<ResponseBody> {
    vo.modifier = req.cookies.token;
    const mergeId = await this.branchMergeService.save(vo);
    this.logger.info(`user ${vo.modifier} save merge, merge id: ${mergeId}.`);
    return ResponseBody.okWithData(mergeId);
  }

  @Get('/diffkey/generate/:mergeId')
  @Permission(PermissionCtl.MERGE_BRANCH)
  async generateDiffKey(@Param('mergeId') mergeId: number): Promise<ResponseBody> {
    await this.branchMergeService.generateDiffKey(mergeId);
    return ResponseBody.ok();
  }

  @Post('/merge')
  @Permission(PermissionCtl.MERGE_BRANCH)
  async merge(@Body() vo: BranchMergeSubmitVO, @Request() req): Promise<ResponseBody> {
    const currentUser = req.cookies.token;
    await this.branchMergeService.merge(vo, currentUser);
    this.logger.info(`user ${currentUser} merge, merge id: ${vo.mergeId}.`);
    return ResponseBody.ok();
  }
}
