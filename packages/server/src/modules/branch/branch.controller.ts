import {
  Controller,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';
import { ResponseBody } from 'src/vo/ResponseBody';
import { BranchPage } from 'src/vo/Page';
import { BranchBody } from 'src/vo/BranchBody';
import { CompareVO } from 'src/vo/CompareVO';
import { PermissionGuard } from 'src/permission/permission.guard';
import { Permission } from 'src/permission/permission.decorator';
import { PermissionCtl } from 'src/constant/constant';

@Controller('branch')
@UseGuards(PermissionGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * 根据projectId查询branch
   * @param projectId projectId
   */
  @Get('/list/:projectId')
  async findListByProjectId(@Param('projectId') projectId: number): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchService.findBranchByProjectId(projectId));
  }

  @Get('/list')
  async findAllBranch(): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchService.findAllBranch());
  }

  @Get('/:id')
  async getBranchById(@Param('id') id: number): Promise<ResponseBody> {
    const branch: Branch = await this.branchService.getBranchById(id);
    if (undefined === branch) {
      return ResponseBody.error('branch is not exist!', 500);
    }
    return ResponseBody.okWithData(branch);
  }
  /**
   * 分页查询
   */
  @Post('/all')
  @UsePipes(new ValidationPipe())
  async findBranchList(@Body() page: BranchPage): Promise<ResponseBody> {
    return ResponseBody.okWithData(await this.branchService.findAllWithPage(page));
  }

  /**
   * 根据id删除branch
   * @param id id
   */
  @Delete('/delete/:id')
  @Permission(PermissionCtl.DELETE_BRANCH)
  async deleteBranch(@Param('id') id: number): Promise<ResponseBody> {
    await this.branchService.deleteBranch(id);
    return ResponseBody.okWithData('delete success');
  }

  /**
   * 新增branch
   * @param branchBody branchBody
   */
  @Post('/save')
  @UsePipes(new ValidationPipe())
  async addBranch(@Body() branchBody: BranchBody, @Request() req): Promise<ResponseBody> {
    branchBody.user = req.cookies.token;
    await this.branchService.save(branchBody);
    return ResponseBody.okWithData('save branch success');
  }

  @Post('/compare')
  @UsePipes(new ValidationPipe())
  async branchCompare(@Body() compareVO: CompareVO): Promise<ResponseBody> {
    if (compareVO.source === compareVO.destination) {
      return ResponseBody.error('Can not compare the same branch!', 500);
    }
    return ResponseBody.okWithData(await this.branchService.compare(compareVO));
  }
}
