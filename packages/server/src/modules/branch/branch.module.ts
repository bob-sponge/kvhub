import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchKey } from 'src/entities/BranchKey';
import { Project } from 'src/entities/Project';
import { BranchController } from './branch.controller';
import { BranchMerge } from 'src/entities/BranchMerge';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, BranchKey, Project, BranchMerge])],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule { }
