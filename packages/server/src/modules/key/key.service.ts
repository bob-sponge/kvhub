import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Key } from 'src/entities/Key';
import { Repository } from 'typeorm';

@Injectable()
export class KeyService {
  constructor(@InjectRepository(Key) private readonly keyRepository: Repository<Key>) {}

  async findAll(): Promise<Key[]> {
    return await this.keyRepository.find({ delete: false });
  }
}
