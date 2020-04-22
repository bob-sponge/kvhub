import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Repository } from 'typeorm';

@Injectable()
export class NamespaceService {
  constructor(@InjectRepository(Namespace) 
  private readonly namespaceRepository: Repository<Namespace>) {}

  async findAll(): Promise<Namespace[]> {
    return await this.namespaceRepository.find();
  }

  async findByProjectId(projectId:number): Promise<Namespace[]> {
    return await this.namespaceRepository.find({projectId,delete:false});
  }

  async count(){
    return await this.namespaceRepository.count();
  }
}
