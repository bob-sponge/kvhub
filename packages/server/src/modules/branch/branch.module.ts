import { Module, forwardRef } from '@nestjs/common';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchKey } from 'src/entities/BranchKey';
import { Project } from 'src/entities/Project';
import { BranchController } from './branch.controller';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchCommit } from 'src/entities/BranchCommit';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { MergeDiffChangeKey } from 'src/entities/MergeDiffChangeKey';
import { Namespace } from 'src/entities/Namespace';
import { KeyModule } from '../key/key.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      BranchKey,
      Key,
      Keyname,
      Keyvalue,
      Project,
      BranchMerge,
      BranchCommit,
      MergeDiffChangeKey,
      Namespace,
    ]),
    forwardRef(() => KeyModule),
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
