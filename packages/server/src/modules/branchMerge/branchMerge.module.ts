import { Module } from '@nestjs/common';
import { BranchMergeController } from './branchMerge.controller';
import { BranchMergeService } from './branchMerge.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Branch } from 'src/entities/Branch';
import { BranchModule } from '../branch/branch.module';

@Module({
  imports: [TypeOrmModule.forFeature([BranchMerge, Branch]),BranchModule],
  controllers: [BranchMergeController],
  providers: [BranchMergeService],
  exports: [BranchMergeService],
})
export class BranchMergeModule {}
