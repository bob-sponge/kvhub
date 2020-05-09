import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/Project';
import { BranchModule } from '../branch/branch.module';
import { KeyModule } from '../key/key.module';
import { LanguagesModule } from '../languages/languages.module';
import { ProjectLanguageModule } from '../projectLanguage/projectLanguage.module';
import { NamespaceModule } from '../namespace/namespace.module';
import { Namespace } from 'src/entities/Namespace';
import { Keyvalue } from 'src/entities/Keyvalue';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Namespace, Keyvalue]),
    BranchModule,
    KeyModule,
    LanguagesModule,
    ProjectLanguageModule,
    NamespaceModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
