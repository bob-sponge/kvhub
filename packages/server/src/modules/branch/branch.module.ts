import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchKey } from 'src/entities/BranchKey';
import { Project } from 'src/entities/Project';
import { BranchController } from './branch.controller';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { MergeDiffChangeKey } from 'src/entities/MergeDiffChangeKey';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, BranchKey, Key, Keyname, Keyvalue, Project, BranchMerge, MergeDiffChangeKey]),
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
