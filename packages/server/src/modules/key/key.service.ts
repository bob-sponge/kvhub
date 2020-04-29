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

  // key left join keyvalue
  async findKeyWithKeyValue(): Promise<any[]> {
    return await this.keyRepository.query(
      'SELECT k.id as key_id, k.actual_id, k.namespace_id, v.language_id, v.value' +
        ' FROM key k LEFT JOIN keyvalue v ON k.id = v.key_id WHERE v.latest = TRUE AND k.delete = FALSE',
    );
  }

  async countMaster(branchId:number,namespaceId:number):Promise<number> {
    return await this.keyRepository.query(
      ' select count(*) from key k left join branch_key bk ' + 
      ' on k.id = bk.key_id where bk.delete = false and k.delete = false ' +
      ' and bk.branch_id = '+branchId+' and k.namespace_id = '+ namespaceId +' '
    );
  }
  
  // key: count(key) 因为只会获取keyvalue的最新值，所以count(key)既是count(language)
  async countKey(): Promise<any[]> {
    return await this.keyRepository.query(
      'SELECT key.id, count(key.id) from key LEFT JOIN keyvalue ON key.id = keyvalue.key_id' +
        ' WHERE keyvalue.latest = TRUE GROUP BY key.id ORDER BY key.id',
    );
  }
}
