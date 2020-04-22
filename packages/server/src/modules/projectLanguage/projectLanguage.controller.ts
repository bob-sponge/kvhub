import { Controller, Get } from '@nestjs/common';
import { ProjectLanguageService } from './projectLanguage.service';
import { Dashboard } from 'src/vo/Dashboard';

@Controller('projectLanguage')
export class ProjectLanguageController {
  constructor(private readonly projectLanguageService: ProjectLanguageService) {}
}
