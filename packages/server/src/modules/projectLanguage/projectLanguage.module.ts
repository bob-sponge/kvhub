import { Module } from '@nestjs/common';
import { ProjectLanguageController } from './projectLanguage.controller';
import { ProjectLanguageService } from './projectLanguage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectLanguage])],
  controllers: [ProjectLanguageController],
  providers: [ProjectLanguageService],
  exports: [ProjectLanguageService],
})
export class ProjectLanguageModule {}
