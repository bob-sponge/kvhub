import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from 'src/entities/Language';
import { Repository } from 'typeorm';

@Injectable()
export class LanguagesService {
  constructor(@InjectRepository(Language) private readonly languagesRepository: Repository<Language>) {}

  async findAll(): Promise<Language[]> {
    return await this.languagesRepository.find();
  }

  async findOne(id: number): Promise<boolean> {
    return (await this.languagesRepository.findOne({ id: id })) === undefined;
  }
}
