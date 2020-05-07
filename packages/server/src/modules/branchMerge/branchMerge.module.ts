import { Module } from '@nestjs/common';
import { BranchMergeController } from './branchMerge.controller';
import { BranchMergeService } from './branchMerge.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchMerge } from 'src/entities/BranchMerge';

@Module({
  imports: [TypeOrmModule.forFeature([BranchMerge])],
  controllers: [BranchMergeController],
  providers: [BranchMergeService],
  exports: [BranchMergeService],
})
export class BranchMergeModule {}
