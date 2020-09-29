import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';
import { ProjectLanguageDTO } from 'src/modules/projectLanguage/dto/ProjectLanguageDTO';
import { Repository, Not } from 'typeorm';

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
    if (projectLanguage !== null) {
      if (projectLanguage.id !== null && projectLanguage.id !== undefined) {
        const exist = await this.projectLanguageRepository.find({
          where: { id: Not(projectLanguage.id), languageId: projectLanguage.languageId, delete: false },
        });
        if (exist !== null && exist.length > 0) {
          throw new BadRequestException('This language is exist!');
        }
      } else {
        const exist = await this.projectLanguageRepository.find({
          where: { projectId: projectLanguage.projectId, languageId: projectLanguage.languageId, delete: false },
        });

        if (exist !== null && exist.length > 0) {
          throw new BadRequestException('This language is exist!');
        }
      }
    }
    projectLanguage.delete = false;
    await this.projectLanguageRepository.save(projectLanguage);
  }

  async findByProjectId(projectId: number): Promise<ProjectLanguageDTO[]> {
    return await this.projectLanguageRepository.query(
      'select pl.id id,l.id "languageId",l.name "languageName" from project_language pl ' +
        'left join language l on pl.language_id = l.id ' +
        'where pl.delete = false and pl.project_id = ' +
        projectId +
        ' order by id',
    );
  }

  async delete(id: number): Promise<void> {
    const projectLanguage = await this.projectLanguageRepository.findOne(id);
    if (projectLanguage === undefined) {
      throw new BadRequestException('project language is not exist');
    } else {
      // 找到 project id
      const projectId = projectLanguage.projectId;
      const refLanguageId = await this.projectLanguageRepository.query(
        `select reference_language_id from project where id=${projectId}`,
      );
      if (projectLanguage.languageId === refLanguageId[0].reference_language_id) {
        throw new BadRequestException('refrence language can not delete.');
      }
      projectLanguage.delete = true;
      await this.projectLanguageRepository.save(projectLanguage);
    }
  }
}
