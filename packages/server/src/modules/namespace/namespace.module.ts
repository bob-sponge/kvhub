import { Module } from '@nestjs/common';
import { NamespaceController } from './namespace.controller';
import { NamespaceService } from './namespace.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Keyvalue } from 'src/entities/Keyvalue';
import { Key } from 'src/entities/Key';
import { BranchKey } from 'src/entities/BranchKey';
import { Keyname } from 'src/entities/Keyname';
import { Branch } from 'src/entities/Branch';
import { BranchCommit } from 'src/entities/BranchCommit';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Project } from 'src/entities/Project';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Namespace,
      Keyvalue,
      Key,
      BranchKey,
      Keyname,
      Branch,
      BranchCommit,
      BranchMerge,
      Project,
    ]),
  ],
  controllers: [NamespaceController],
  providers: [NamespaceService],
  exports: [NamespaceService],
})
export class NamespaceModule {}
