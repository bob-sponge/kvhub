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

  async findKeyWithKeyValue(): Promise<any[]> {
    return await this.keyRepository.query(
      'SELECT k.id as key_id, k.actual_id, k.namespace_id, v.language_id, v.value' +
        ' FROM key k LEFT JOIN keyvalue v ON k.id = v.key_id WHERE v.latest = TRUE AND k.delete = FALSE',
    );
  }
}
