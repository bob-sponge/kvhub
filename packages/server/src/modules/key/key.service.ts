import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { BranchService } from 'src/modules/branch/branch.service';
import { KeyInfoDto } from 'src/modules/key/dto/KeyInfoDTO';
import { Repository } from 'typeorm';
import { ValueDTO } from './dto/ValueDTO';
import { KeyValueDetailVO } from 'src/vo/KeyValueDetailVO';
import { ValueVO } from 'src/vo/ValueVO';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key) private readonly keyRepository: Repository<Key>,
    @InjectRepository(Keyname) private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Keyvalue) private readonly keyvalueRepository: Repository<Keyvalue>,
    private readonly branchService: BranchService,
  ) {}

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

  async getKeyWithBranchIdAndNamespaceId(branchId: number, namespaceId: number): Promise<Key[]> {
    return await this.keyRepository.query(
      ' select k.* from key k left join branch_key bk ' +
        ' on k.id = bk.key_id where bk.delete = false and k.delete = false ' +
        ' and bk.branch_id = ' +
        branchId +
        ' and k.namespace_id = ' +
        namespaceId +
        ' ',
    );
  }

  async getKeyWithBranchId(branchId: number): Promise<Key[]> {
    return await this.keyRepository.query(
      ' select k.* from key k left join branch_key bk ' +
        ' on k.id = bk.key_id where bk.delete = false and k.delete = false ' +
        ' and bk.branch_id = ' +
        branchId,
    );
  }

  // key: count(key) 因为只会获取keyvalue的最新值，所以count(key)既是count(language)
  async countKey(): Promise<any[]> {
    return await this.keyRepository.query(
      'SELECT key.id, count(key.id) from key LEFT JOIN keyvalue ON key.id = keyvalue.key_id' +
        ' WHERE keyvalue.latest = TRUE GROUP BY key.id ORDER BY key.id',
    );
  }

  async getKeyByBranchIdAndKeyActualId(branchId: number, actualId: number): Promise<Key> | undefined {
    let result = new Key();
    let masterBranch = new Branch();
    const branch = await this.branchService.getBranchById(branchId);
    if (branch === undefined) {
      throw new BadRequestException('branch is not exist');
    } else if (branch.master !== null && !branch.master) {
      masterBranch = await this.branchService.findMasterBranchByProjectId(branch.projectId);
    } else {
      masterBranch = branch;
    }
    let keyList: Key[] = [];
    keyList = await this.keyRepository.find({
      join: { alias: 'key', leftJoin: { key: 'branch_key' } },
      where: { actualId, branchId: branch.id },
    });
    if (keyList === null || keyList.length === 0) {
      if (branch.master !== null && branch.master) {
        return undefined;
      } else {
        keyList = await this.keyRepository.find({
          join: { alias: 'key', leftJoin: { key: 'branch_key' } },
          where: { actualId, branchId: masterBranch.id },
        });
        if (keyList === null || keyList.length === 0) {
          return undefined;
        } else {
          result = keyList[0];
        }
      }
    }
    return result;
  }

  async getKeyInfo(id: number, needValue: boolean): Promise<KeyInfoDto> | undefined {
    let result = new KeyInfoDto();
    const key = await this.keyRepository.findOne(id);
    if (key === undefined || (key.delete !== null && key.delete)) {
      throw new BadRequestException('key is not exist!');
    } else {
      result.id = key.id;
      result.actualId = key.actualId;
    }

    const keyname = await this.keynameRepository.find({ keyId: key.id });
    if (keyname === null || keyname.length === 0) {
      throw new BadRequestException('key name is not exist!');
    } else {
      result.name = keyname[0].name;
    }
    if (needValue !== null && needValue) {
      const valueDtoList: ValueDTO[] = await this.keyvalueRepository.query(
        'select v.id,v.language_id "languageId",l.name "language",v.latest,v.value ' +
          ' from keyvalue v left join language l on v.language_id = l.id where v.latest = true and v.key_id = ' +
          result.id,
      );
      result.value = valueDtoList;
    }
    return result;
  }

  async getValueInfo(id: number): Promise<ValueDTO> {
    return await this.keyvalueRepository.query(
      'select v.id,v.language_id "languageId",l.name "language",v.latest,v.value ' +
        ' from keyvalue v left join language l on v.language_id = l.id where v.id = ' +
        id,
    );
  }

  async getKeyListByBranchId(branchId: number): Promise<KeyValueDetailVO[]> {
    // 通过分支id，获取对应分支下所有的key及key对应的name和value
    let result: KeyValueDetailVO[] = [];
    const branch = await this.branchService.getBranchById(branchId);
    let masterBranchId: number = 0;
    let isMaster: boolean = false;
    if (branch === undefined) {
      throw new BadRequestException('Branch is not exist!');
    } else if (branch.master !== null && branch.master) {
      masterBranchId = branch.id;
      isMaster = true;
    } else {
      const masterBranch = await this.branchService.findMasterBranchByProjectId(branch.projectId);
      if (masterBranch !== undefined) {
        masterBranchId = masterBranch.id;
      }
    }
    let keyList: Key[] = [];
    let masterKeyList = await this.getKeyWithBranchId(masterBranchId);
    if (!isMaster) {
      // 由于分支不是主分支，可能存在分支上独立的key或者master分支修改过的key，需要对比
      let branchKeyList = await this.getKeyWithBranchId(branchId);
      if (branchKeyList !== null && branchKeyList.length > 0) {
        for (let k = 0; k < masterKeyList.length; k++) {
          const masterKey = masterKeyList[k];
          let branchKeyExist = false;
          for (let l = 0; l < branchKeyList.length; l++) {
            const branchKey = branchKeyList[l];
            if (branchKey.actualId === masterKey.actualId) {
              branchKeyExist = true;
              branchKeyList.splice(l, 1);
              keyList.push(branchKey);
              break;
            }
          }
          if (!branchKeyExist) {
            keyList.push(masterKey);
          }
        }
        if (branchKeyList.length > 0) {
          keyList = keyList.concat(branchKeyList);
        }
      } else {
        keyList = masterKeyList;
      }
    } else {
      keyList = masterKeyList;
    }

    if (keyList !== null && keyList.length > 0) {
      for (let i = 0; i < keyList.length; i++) {
        let detail = new KeyValueDetailVO();
        const key = keyList[i];
        detail.keyId = key.id;
        detail.keyActualId = key.actualId;

        const keyName = await this.keynameRepository.find({ keyId: detail.keyId });
        if (keyName !== null && keyName.length > 0) {
          detail.keyName = keyName[0].name;
        }
        let valueList: ValueVO[] = [];
        const value = await this.keyvalueRepository.find({ keyId: detail.keyId, latest: true });
        if (value !== null && value.length > 0) {
          value.forEach(v => {
            valueList.push({ valueId: v.id, value: v.value, languageId: v.languageId });
          });
          detail.valueLit = valueList;
        }
        result.push(detail);
      }
    }
    return result;
  }
}
