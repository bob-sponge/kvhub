import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/Project';
import { BranchModule } from '../branch/branch.module';
import { KeyModule } from '../key/key.module';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), BranchModule, KeyModule, LanguagesModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
