import { Module } from '@nestjs/common';
import { BranchMergeController } from './branchMerge.controller';
import { BranchMergeService } from './branchMerge.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchMerge } from 'src/entities/BranchMerge';
import { MergeDiffKey } from 'src/entities/MergeDiffKey';
import { MergeDiffValue } from 'src/entities/MergeDiffValue';
import { Branch } from 'src/entities/Branch';
import { BranchModule } from '../branch/branch.module';
import { KeyModule } from 'src/modules/key/key.module';

@Module({
  imports: [TypeOrmModule.forFeature([BranchMerge, Branch, MergeDiffKey, MergeDiffValue]),BranchModule,KeyModule],
  controllers: [BranchMergeController],
  providers: [BranchMergeService],
  exports: [BranchMergeService],
})
export class BranchMergeModule {}
