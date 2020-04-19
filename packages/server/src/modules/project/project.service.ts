import { Injectable } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private readonly projectRepository: Repository<Project>) {}
  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }
}
