import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchKey } from 'src/entities/BranchKey';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, BranchKey])],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
