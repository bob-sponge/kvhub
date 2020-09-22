/* eslint-disable max-len */
import { BadRequestException, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { Language } from 'src/entities/Language';
import { BranchService } from 'src/modules/branch/branch.service';
import { KeyInfoDto } from 'src/modules/key/dto/KeyInfoDTO';
import { Repository, getRepository } from 'typeorm';
import { ValueDTO } from './dto/ValueDTO';
import { KeyValueDetailVO } from 'src/vo/KeyValueDetailVO';
import { ValueVO } from 'src/vo/ValueVO';
import { ErrorMessage } from 'src/constant/constant';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key) private readonly keyRepository: Repository<Key>,
    @InjectRepository(Keyname) private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Keyvalue) private readonly keyvalueRepository: Repository<Keyvalue>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    @Inject(forwardRef(() => BranchService))
    private readonly branchService: BranchService,
  ) {}

  async findAll(): Promise<Key[]> {
    return await this.keyRepository.find({ delete: false });
  }

  async getKeyWithBranchIdAndNamespaceId(branchId: number, namespaceId: number): Promise<Key[]> {
    return await this.keyRepository.query(
      ' select k.id,k.actual_id "actualId",k.namespace_id "namespaceId",k.modifier,k.modify_time "modifyTime",k.delete' +
        ' from key k left join branch_key bk ' +
        ' on k.id = bk.key_id where bk.delete = false and k.delete = false ' +
        ' and bk.branch_id = ' +
        branchId +
        ' and k.namespace_id = ' +
        namespaceId +
        ' ',
    );
  }

  async getKeyInfoByBranchId(branchId: number): Promise<KeyValueDetailVO[]> {
    const query = `
    SELECT *
    FROM (
      SELECT keyid, keynameid, keyname, valueid, languageid
        , keyvalue, actualid, namespaceId
      FROM ((
        SELECT *
        FROM (
          SELECT k.id AS keyid, k.actual_id AS actualid, k.namespace_id AS namespaceId
          FROM key k
          WHERE k.delete = 'f'
        ) s1
          JOIN (
            SELECT key_id
            FROM branch_key
            WHERE branch_id = ${branchId} and delete = false
          ) s2
          ON s1.keyid = s2.key_id
          JOIN (
            SELECT kn.id AS keynameid, key_id, kn.name AS keyname
            FROM keyname kn
            WHERE latest = true
          ) s3
          ON s2.key_id = s3.key_id) s4
          LEFT JOIN (
            SELECT kv.id AS valueid, kv.language_id AS languageid, key_id, kv.value AS keyvalue
            FROM keyvalue kv
            WHERE latest = true
          ) s5
          ON s4.keyid = s5.key_id
      ) s6
      -- WHERE keynameid = actualid
    ) s7

    ORDER BY keyName ASC
    `;
    const keyinfos = await this.keyRepository.query(query);
    const languages: Language[] = await this.getAllLanguage();
    const languageMap = new Map();
    languages.forEach(item => {
      languageMap.set(item.id, item.name);
    });
    const kvds = new Map();
    keyinfos.forEach(e => {
      const keyId = e.keyid;
      const keyActualId = e.actualid;
      const keyName = e.keyname;
      const namespaceId = e.namespaceid;
      const valueId = e.valueid;
      const value = e.keyvalue;
      const languageId = e.languageid;
      const languageName = languageMap.get(languageId);
      if (kvds.has(keyId)) {
        const kvd = kvds.get(keyId);
        const vas = new ValueVO();
        vas.languageId = languageId;
        vas.languageName = languageName;
        vas.value = value;
        vas.valueId = valueId;
        const vl = kvd.valueList;
        vl.push(vas);
        kvd.valueList = vl;
      } else {
        const vas = new ValueVO();
        vas.languageId = languageId;
        vas.languageName = languageName;
        vas.value = value;
        vas.valueId = valueId;
        const kvd = new KeyValueDetailVO();
        kvd.keyId = keyId;
        kvd.keyActualId = keyActualId;
        kvd.keyName = keyName;
        kvd.namespaceId = namespaceId;
        kvd.valueList = [vas];
        kvds.set(keyId, kvd);
      }
    });
    const result = [];
    kvds.forEach((v, _) => {
      result.push(v);
    });
    return result;
  }

  async getAllLanguage(): Promise<Language[]> {
    const query = 'select * from language';
    const result: Language[] = await this.keyRepository.query(query);
    return result;
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
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    } else if (branch.master !== null && !branch.master) {
      masterBranch = await this.branchService.findMasterBranchByProjectId(branch.projectId);
    } else {
      masterBranch = branch;
    }
    let keyList: Key[] = [];
    keyList = await getRepository(Key)
      .createQueryBuilder('key')
      .leftJoinAndSelect('branch_key', 'bk', 'bk.key_id = key.id')
      .where('key.actual_id = :actualId and bk.branch_id = :branchId', { actualId, branchId: branch.id })
      .printSql()
      .getMany();
    if (keyList === null || keyList.length === 0) {
      if (branch.master !== null && branch.master) {
        return undefined;
      } else {
        keyList = await getRepository(Key)
          .createQueryBuilder('key')
          .leftJoinAndSelect('branch_key', 'bk', 'bk.key_id = key.id')
          .where('key.actual_id = :actualId and bk.branch_id = :branchId', { actualId, branchId: masterBranch.id })
          .printSql()
          .getMany();
        if (keyList === null || keyList.length === 0) {
          return undefined;
        }
      }
    }
    result = keyList[0];
    return result;
  }

  async getKeyInfo(id: number, needValue: boolean): Promise<KeyInfoDto> | undefined {
    let result = new KeyInfoDto();
    const key = await this.keyRepository.findOne(id);
    if (key === undefined || (key.delete !== null && key.delete)) {
      throw new BadRequestException(ErrorMessage.KEY_NOT_EXIST);
    } else {
      result.id = key.id;
      result.actualId = key.actualId;
    }

    const keyname = await this.keynameRepository.find({ keyId: key.id });
    if (keyname === null || keyname.length === 0) {
      throw new BadRequestException('key name is not exist!');
    } else {
      result.name = keyname[0].name;
      result.keynameId = keyname[0].id;
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

  async getValueInfo(id: number): Promise<ValueDTO> | undefined {
    const valueDTO = await this.keyvalueRepository.query(
      'select v.id,v.language_id "languageId",l.name "language",v.latest,v.value ' +
        ' from keyvalue v left join language l on v.language_id = l.id where v.id = ' +
        id,
    );
    if (valueDTO !== null && valueDTO.length > 0) {
      return valueDTO[0];
    } else {
      return undefined;
    }
  }

  async getKeyListByBranchId(branchId: number): Promise<KeyValueDetailVO[]> {
    // 通过分支id，获取对应分支下所有的key及key对应的name和value
    const branch = await this.branchService.getBranchById(branchId);
    let masterBranchId: number = 0;
    let isMaster: boolean = false;
    if (branch === undefined) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    } else if (branch.master !== null && branch.master) {
      masterBranchId = branch.id;
      isMaster = true;
    } else {
      const masterBranch = await this.branchService.findMasterBranchByProjectId(branch.projectId);
      if (masterBranch !== undefined) {
        masterBranchId = masterBranch.id;
      }
    }
    let resultKeyList: KeyValueDetailVO[];
    const masterKeyList: KeyValueDetailVO[] = await this.getKeyInfoByBranchId(masterBranchId);
    if (!isMaster) {
      const branchKeyList: KeyValueDetailVO[] = await this.getKeyInfoByBranchId(branch.id);
      // master 分支的key 移除条件： 比较分支 namespace , key name 相同的key
      const filterMasterKeyList = [];
      masterKeyList.forEach(i => {
        const filter = branchKeyList.filter(j => j.keyName === i.keyName && j.namespaceId === i.namespaceId);
        if ((filter.length = 0)) {
          filterMasterKeyList.push(i);
        }
      });
      resultKeyList = filterMasterKeyList.concat(branchKeyList);
    } else {
      resultKeyList = masterKeyList;
    }

    return resultKeyList;
  }

  async delete(id: number) {
    const key = await this.keyRepository.findOne(id);
    if (null === key || (key.delete !== null && key.delete)) {
      throw new BadRequestException(ErrorMessage.KEY_NOT_EXIST);
    }
    key.delete = true;
    await this.keyRepository.save(key);
  }

  async getKeynameByKeyId(keyId: number): Promise<Keyname> | undefined {
    const keyNameList = await this.keynameRepository.find({ where: { keyId } });
    if (keyNameList === null || keyNameList.length === 0) {
      return undefined;
    } else {
      return keyNameList[0];
    }
  }
}
