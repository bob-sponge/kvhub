import { Injectable, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';
import { ProjectLanguageDTO } from 'src/dto/ProjectLanguageDTO';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectLanguageService {
  constructor(
    @InjectRepository(ProjectLanguage)
    private readonly projectLanguageRepository: Repository<ProjectLanguage>,
  ) {}

  async findAll(): Promise<ProjectLanguage[]> {
    return await this.projectLanguageRepository.find();
  }

  async save(projectLanguage: ProjectLanguage): Promise<void> {
    await this.projectLanguageRepository.save(projectLanguage);
  }

  async findByProjectId(projectId: number): Promise<ProjectLanguageDTO[]> {
    return await this.projectLanguageRepository.query(
      'select pl.id id,l.name \"languageName\" from project_language pl ' +
        'left join language l on pl.language_id = l.id ' +
        'where pl.delete = false and pl.project_id = ' +
        projectId +
        ' order by id',
    );
  }

  async delete(id:number): Promise<void>{
    await this.projectLanguageRepository.findOne(id).then(function(data) {
      if (data !== undefined) {
        data.delete = true;
        this.projectLanguageRepository.update(data);
      } else {
        throw new BadRequestException('project language is not exist');
      }
    });
  }
}
