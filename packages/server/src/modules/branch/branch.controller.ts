import { Controller, Get, Param } from '@nestjs/common';
import { Branch } from 'src/entities/Branch';
import { BranchService } from './branch.service';

@Controller('branch')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get("/list/:projectId")
    async findListByProjectId(@Param('projectId') projectId:number): Promise<Branch[]> {
        return this.branchService.findBranchByProjectId(projectId);
    }

    @Get("/list")
    async findList(): Promise<Branch[]> {
        return this.branchService.findAll();
    }
}
