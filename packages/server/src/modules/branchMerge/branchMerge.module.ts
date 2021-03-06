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
import { BranchCommit } from 'src/entities/BranchCommit';
import { BranchKey } from 'src/entities/BranchKey';
import { Namespace } from 'src/entities/Namespace';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { Project } from 'src/entities/Project';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      BranchCommit,
      BranchMerge,
      BranchKey,
      Key,
      Keyname,
      Keyvalue,
      MergeDiffKey,
      MergeDiffValue,
      Namespace,
      Project
    ]),
    BranchModule,
    KeyModule,
  ],
  controllers: [BranchMergeController],
  providers: [BranchMergeService],
  exports: [BranchMergeService],
})
export class BranchMergeModule {}
