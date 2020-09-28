/* eslint-disable max-len */
/* eslint-disable no-multi-str */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Repository, In } from 'typeorm';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import * as Log4js from 'log4js';
import { Keyvalue } from 'src/entities/Keyvalue';
import { BranchKey } from 'src/entities/BranchKey';
import { Keyname } from 'src/entities/Keyname';
import { Key } from 'src/entities/Key';
import { Branch } from 'src/entities/Branch';
import { UUIDUtils } from 'src/utils/uuid';
import { BranchCommit } from 'src/entities/BranchCommit';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Project } from 'src/entities/Project';
import { CommonConstant, ErrorMessage } from 'src/constant/constant';
import * as fs from 'fs';
import { ConfigService } from '@ofm/nestjs-utils';
import { Language } from 'src/entities/Language';
import { BranchService } from '../branch/branch.service';

@Injectable()
export class NamespaceService {
  constructor(
    @InjectRepository(Namespace)
    private readonly namespaceRepository: Repository<Namespace>,
    @InjectRepository(Keyvalue)
    private readonly keyvalueRepository: Repository<Keyvalue>,
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
    @InjectRepository(BranchKey)
    private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Keyname)
    private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchCommit)
    private readonly branchCommitRepository: Repository<BranchCommit>,
    @InjectRepository(BranchMerge)
    private readonly branchMergeRepository: Repository<BranchMerge>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly config: ConfigService,
    private readonly branchService: BranchService,
  ) {}

  async deleteNamespace(namespaceId: number, modifier: any) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const modifyTime = new Date().toLocaleString();
    const q = `update namespace set delete=true, modifier='${modifier}', modify_time='${modifyTime}' where id=${namespaceId}`;
    logger.info(`q: ${q}`);
    await this.namespaceRepository.query(q);
  }

  async deleteKey(keyId: number, modifier: any) {
    // todo
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const modifyTime = new Date().toLocaleString();
    const q = `update key set delete=true, modifier='${modifier}', modify_time='${modifyTime}' where id=${keyId}`;
    logger.info(`q: ${q}`);
    await this.keyRepository.query(q);
  }

  async editKeyname(keyId: any, keyName: any, modifier: any, modifyTime: any) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';

    // 开启事务
    // const connection = getConnection();
    // const queryRunner = connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    try {
      const keyNameInfo = await this.keyRepository.query(`select * from keyname where key_id = ${keyId}`);
      if (keyNameInfo.filter(a => a.name === keyName.trim()).length > 0) {
        throw new Error(`Key id get name is equals key name ${keyName}`);
      }
      // 判断重复问题
      // 查找当前key的namespce id 和 branch id
      const namespaceId = await this.keyRepository.query(`select namespace_id from key where id =${keyId}`);
      const branchId = await this.keyRepository.query(`select branch_id from branch_key where key_id= ${keyId}`);
      // 查找输入名字的一致的 namespace ids 和 branch ids
      const namespaceIds = await this.keyRepository.query(
        `select DISTINCT namespace_id from key where id in (select key_id from keyname where name='${keyName}' and latest=true) and "delete"=false`,
      );
      const branchIds = await this.keyRepository.query(
        `select DISTINCT branch_id from branch_key where key_id in (select key_id from keyname where name='${keyName}' and latest=true) and delete =false`,
      );
      const c1 = branchIds.filter(item => item.branch_id === branchId[0].branch_id);
      const c2 = namespaceIds.filter(item => item.namespace_id === namespaceId[0].namespace_id);
      if (c1.length > 0 && c2.length > 0) {
        throw new Error(`key name ${keyName} already exist!`);
      }
      const oldKeyNameId = keyNameInfo[0].id;
      // key 表不动，key name 增加，key value 增加
      // todo branch commit record
      const commitId = UUIDUtils.generateUUID();
      const keyNameEntity = new Keyname();
      keyNameEntity.keyId = keyId;
      keyNameEntity.modifier = modifier;
      keyNameEntity.modifyTime = modifyTime;
      keyNameEntity.name = keyName.trim();
      keyNameEntity.commitId = commitId;
      keyNameEntity.latest = true;
      const insertKeyName = await this.keynameRepository.insert(keyNameEntity);
      const keyNameId = insertKeyName.raw[0].id;
      logger.info(`insert key name id: ${keyNameId}`);
      // key value
      const keyvalueInfo = await this.keyvalueRepository.query(
        `select * from keyvalue where key_id = ${keyId} and latest is true`,
      );
      await this.keynameRepository.query(`UPDATE keyname SET latest = false WHERE id = ${oldKeyNameId}`);
      // 更新 value 表的 latest 为false
      await this.keyvalueRepository.query(`UPDATE keyvalue SET latest = false WHERE key_id = ${keyId}`);
      // 插入key Value 表,
      let keyValueEntitys = [];
      keyvalueInfo.forEach(d => {
        const languageId = d.language_id;
        const value = d.value;
        const keyValueEntity = new Keyvalue();
        keyValueEntity.value = value;
        keyValueEntity.keyId = keyId;
        keyValueEntity.commitId = commitId;
        keyValueEntity.languageId = languageId;
        keyValueEntity.latest = true;
        keyValueEntity.modifier = modifier;
        keyValueEntity.midifyTime = modifyTime;
        keyValueEntitys.push(keyValueEntity);
      });
      await this.keyvalueRepository.insert(keyValueEntitys);
      // 更新 key 表actual id 为 key name id
      // this.keyRepository.query(`update key set actual_id=${keyNameId} where id=${keyId}`);

      const reskeynameInfo = this.keynameRepository.query(`select * from keyname where id = ${keyNameId}`);
      //await queryRunner.commitTransaction();
      return reskeynameInfo;
    } catch (error) {
      //await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    }
  }

  async editKeyValue(
    branchId: any,
    namespaceId: any,
    keyId: any,
    keyName: any,
    data: any,
    modifier: any,
    modifyTime: any,
  ) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';

    // 增加分支是否存在merge的验证
    const existBranchMerge = await this.branchMergeRepository.find({
      where: [
        {
          sourceBranchId: branchId,
          type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]),
        },
        {
          targetBranchId: branchId,
          type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]),
        },
      ],
    });
    if (existBranchMerge !== null && existBranchMerge.length > 0) {
      throw new BadRequestException(ErrorMessage.BRANCH_IS_MERGING);
    }
    // 开启事务
    // const connection = getConnection();
    // const queryRunner = connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    const commitId = UUIDUtils.generateUUID();
    keyName = keyName === null || keyName === undefined ? '' : keyName;
    // eslint-disable-next-line @typescript-eslint/quotes
    const zyKeyName = keyName.replace("'", "\\'");
    try {
      if (keyId === '' || keyId === null) {
        // 新增
        // 判断当前分支下是否有同名的 key name, 有抛出异常， 不能保存成功
        // 如果當前分支不是master，还需保证master 分支不存在该key
        const branch = await this.branchRepository.query(`SELECT * FROM branch WHERE id = ${branchId}`);
        if (branch[0].master) {
          const existOn = await this.checkKeyIsExist(branchId, zyKeyName, namespaceId);

          if (existOn) {
            throw new Error(`key name ${keyName} already exist on branch ${branch[0].name} .`);
          }
        } else {
          const project = await this.findProject(namespaceId);
          const projectId = project[0].id;
          const masterBranch = await this.branchService.findMasterBranchByProjectId(projectId);
          const existOn = await this.checkKeyIsExist(branchId, zyKeyName, namespaceId);
          const existOnMaster = await this.checkKeyIsExist(masterBranch.id, zyKeyName, namespaceId);
          if (existOn) {
            throw new Error(`key name already exist on branch ${branch[0].name} .`);
          }
          if (existOnMaster) {
            throw new Error(`key name already exist on branch  ${masterBranch.name}.`);
          }
        }
        // 插入key 表, 获取 key id.
        const keyEntity = new Key();
        keyEntity.modifier = modifier;
        keyEntity.namespaceId = namespaceId;
        keyEntity.modifyTime = modifyTime;
        keyEntity.delete = false;
        keyEntity.actualId = 0;
        const insertKey = await this.keyRepository.insert(keyEntity);
        const keyEntityId = insertKey.raw[0].id;
        // 更新 actual id 为 keyid
        this.keyRepository.query(`update key set actual_id=${keyEntityId} where id=${keyEntityId}`);
        // logger.info(`insert key id: ${keyEntityId}`);
        // 插入branch commit
        const branchCommit = new BranchCommit();
        branchCommit.type = CommonConstant.COMMIT_TYPE_ADD;
        branchCommit.commitId = commitId;
        branchCommit.branchId = branchId;
        branchCommit.commitTime = modifyTime;
        await this.branchCommitRepository.save(branchCommit);
        // 处理其他的关联表
        // 插入 key branch 表
        const branchKeyEntity = new BranchKey();
        branchKeyEntity.branchId = branchId;
        branchKeyEntity.keyId = keyEntityId;
        branchKeyEntity.delete = false;
        await this.branchKeyRepository.insert(branchKeyEntity);
        // 插入keyName 表,
        const keyNameEntity = new Keyname();
        keyNameEntity.keyId = keyEntityId;
        keyNameEntity.modifier = modifier;
        keyNameEntity.modifyTime = modifyTime;
        keyNameEntity.name = keyName;
        keyNameEntity.commitId = commitId;
        // throw new Error('test transaction.');
        await this.keynameRepository.insert(keyNameEntity);
        // const insertKeyName = await this.keynameRepository.insert(keyNameEntity);
        // const keyNameId = insertKeyName.raw[0].id;
        // logger.info(`insert key name id: ${keyNameId}`);
        // this.keyRepository.query(`update key set actual_id=${keyNameId} where id=${keyEntityId}`);
        // 插入key Value 表,
        let keyValueEntitys = [];
        data.forEach(d => {
          const languageId = d.languageId;
          const value = d.value;
          const keyValueEntity = new Keyvalue();
          if (value === null || value === '' || value === undefined) {
            keyValueEntity.value = ' ';
          } else {
            keyValueEntity.value = value;
            keyValueEntity.keyId = keyEntityId;
            keyValueEntity.commitId = commitId;
            keyValueEntity.languageId = languageId;
            keyValueEntity.latest = true;
            keyValueEntity.modifier = modifier;
            keyValueEntity.midifyTime = modifyTime;
            keyValueEntitys.push(keyValueEntity);
          }
        });
        await this.keyvalueRepository.insert(keyValueEntitys);
      } else {
        // 編輯
        const branchCommit = new BranchCommit();
        branchCommit.type = CommonConstant.COMMIT_TYPE_CHANGE;
        branchCommit.commitId = commitId;
        branchCommit.branchId = branchId;
        branchCommit.commitTime = modifyTime;
        await this.branchCommitRepository.save(branchCommit);
        // 根据 key id 查询比较
        const keyNameInfo = await this.keyRepository.query(`select * from keyname where key_id = ${keyId}`);
        const keyIdGetName = keyNameInfo[0].name;
        if (keyIdGetName !== keyName) {
          throw new Error(`Key id get name ${keyIdGetName} not equals key name ${keyName}`);
        }
        // 更新 value 表的 latest 为false
        await this.keyvalueRepository.query(`UPDATE keyvalue SET latest = false WHERE key_id = ${keyId}`);
        // 插入key Value 表,
        let keyValueEntitys = [];
        data.forEach(d => {
          const languageId = d.languageId;
          const value = d.value;
          const keyValueEntity = new Keyvalue();
          if (value === null || value === '' || value === undefined) {
            // keyValueEntity.value = ' ';
          } else {
            keyValueEntity.value = value;
            keyValueEntity.keyId = keyId;
            keyValueEntity.commitId = commitId;
            keyValueEntity.languageId = languageId;
            keyValueEntity.latest = true;
            keyValueEntity.modifier = modifier;
            keyValueEntity.midifyTime = modifyTime;
            keyValueEntitys.push(keyValueEntity);
          }
        });
        await this.keyvalueRepository.insert(keyValueEntitys);
      }
      logger.info(`sync key name: ${keyName} done.`);
      //await queryRunner.commitTransaction();
    } catch (error) {
      //await queryRunner.rollbackTransaction();
      logger.error(`err message: ${error.message}, keyname is ${keyName}, data is ${JSON.stringify(data)}`);
      throw new Error(`${error.message}`);
    }
  }

  async editKeyValueOnlanguage(
    branchId: number,
    languageId: number,
    keyId: number,
    keyvalue: string,
    valueId: number | undefined,
    modifier: any,
    modifyTime: any,
  ) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    logger.info(languageId, keyId, keyvalue);
    languageId = Number.parseInt(languageId.toString());
    branchId = Number.parseInt(branchId.toString());
    // check branch is or not merging status
    const branchMergeList: BranchMerge[] = await this.branchMergeRepository.find({
      where: [
        { sourceBranchId: branchId, type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]) },
        { targetBranchId: branchId, type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]) },
      ],
    });
    if (branchMergeList !== null && branchMergeList.length > 0) {
      throw new BadRequestException(ErrorMessage.BRANCH_IS_MERGING);
    }

    // 保存的 value 不能为空字符串
    if (keyvalue.trim() === '') {
      throw new BadRequestException(ErrorMessage.VALUE_NOT_BLANK);
    }

    // 需要处理， 保证在A 分支创建的key， 在B分支修改，必须重新生成key, key 与分支对应关系为 key : branch = 1 ：1
    const branchKeyByKeyId = await this.branchKeyRepository.query(`select * from branch_key where key_id = ${keyId}`);
    const namespaceByKeyId = await this.keyRepository.findByIds([keyId]);
    const keynameByKeyId = await this.keynameRepository.query(`select * from keyname where key_id = ${keyId}`);
    const keyName = keynameByKeyId[0].name;
    const namespaceId = namespaceByKeyId[0].namespaceId;
    if (branchKeyByKeyId[0].branch_id !== branchId) {
      const commitId = UUIDUtils.generateUUID();
      // 重新生成key
      // 插入key 表, 获取 key id.
      const keyEntity = new Key();
      keyEntity.modifier = modifier;
      keyEntity.namespaceId = namespaceId;
      keyEntity.modifyTime = modifyTime;
      keyEntity.delete = false;
      keyEntity.actualId = keyId;
      const insertKey = await this.keyRepository.insert(keyEntity);
      const keyEntityId = insertKey.raw[0].id;
      logger.info(`insert key id: ${keyEntityId}`);
      // 插入branch commit
      const branchCommit = new BranchCommit();
      branchCommit.type = CommonConstant.COMMIT_TYPE_ADD;
      branchCommit.commitId = commitId;
      branchCommit.branchId = branchId;
      branchCommit.commitTime = modifyTime;
      await this.branchCommitRepository.save(branchCommit);
      // 处理其他的关联表
      // 插入 key branch 表
      const branchKeyEntity = new BranchKey();
      branchKeyEntity.branchId = branchId;
      branchKeyEntity.keyId = keyEntityId;
      branchKeyEntity.delete = false;
      await this.branchKeyRepository.insert(branchKeyEntity);
      // 插入keyName 表,
      const keyNameEntity = new Keyname();
      keyNameEntity.keyId = keyEntityId;
      keyNameEntity.modifier = modifier;
      keyNameEntity.modifyTime = modifyTime;
      keyNameEntity.name = keyName;
      keyNameEntity.commitId = commitId;
      // throw new Error('test transaction.');
      const insertKeyName = await this.keynameRepository.insert([keyNameEntity]);
      const keyNameId = insertKeyName.raw[0].id;
      logger.info(`insert key name id: ${keyNameId}`);
      // this.keyRepository.query(`update key set actual_id=${keyNameId} where id=${keyEntityId}`);
      // 插入key Value 表,修改的是该语言下的，直接用新值插入，如果老的key 下面还有其他语言的，也需要用之前的值插入
      const data = await this.keyvalueRepository.query(`select * from keyvalue where key_id = ${keyId}`);
      let keyValueEntitys = [];
      const keyValueEntity = new Keyvalue();
      if (keyvalue === null || keyvalue === '' || keyvalue === undefined) {
        keyValueEntity.value = ' ';
      }
      keyValueEntity.keyId = keyEntityId;
      keyValueEntity.languageId = languageId;
      keyValueEntity.value = keyvalue;
      keyValueEntity.latest = true;
      keyValueEntity.commitId = branchCommit.commitId;
      keyValueEntity.modifier = modifier;
      keyValueEntity.midifyTime = modifyTime;
      keyValueEntitys.push(keyValueEntity);
      data.forEach(d => {
        const keyValueEntity1 = new Keyvalue();
        const dlanguageId = d.language_id;
        if (dlanguageId !== languageId) {
          const value = d.value;
          if (value === null || value === '' || value === undefined) {
            keyValueEntity1.value = ' ';
          } else {
            keyValueEntity1.value = value;
            keyValueEntity1.keyId = keyEntityId;
            keyValueEntity1.commitId = commitId;
            keyValueEntity1.languageId = dlanguageId;
            keyValueEntity1.latest = true;
            keyValueEntity1.modifier = modifier;
            keyValueEntity1.midifyTime = modifyTime;
            keyValueEntitys.push(keyValueEntity1);
          }
        }
      });
      return await this.keyvalueRepository.insert(keyValueEntitys);
    } else {
      const branchCommit = new BranchCommit();
      branchCommit.type = CommonConstant.COMMIT_TYPE_CHANGE;
      branchCommit.commitId = UUIDUtils.generateUUID();
      branchCommit.branchId = branchId;
      branchCommit.commitTime = modifyTime;
      await this.branchCommitRepository.save(branchCommit);

      if (valueId !== undefined && valueId !== null) {
        const value = await this.keyvalueRepository.findOne(valueId);
        if (value !== undefined) {
          if (!value.latest) {
            throw new BadRequestException(ErrorMessage.VALUE_CHANGED);
          } else {
            value.latest = false;
            value.midifyTime = modifyTime;
            await this.keyvalueRepository.save(value);
          }
        }
      }

      const newValue = new Keyvalue();
      newValue.keyId = keyId;
      newValue.languageId = languageId;
      newValue.value = keyvalue;
      newValue.latest = true;
      newValue.commitId = branchCommit.commitId;
      newValue.modifier = modifier;
      newValue.midifyTime = modifyTime;
      return await this.keyvalueRepository.insert(newValue);
    }
  }

  async getNamespaceLanguage(id: number) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const languageQuery = `
    SELECT *
    FROM language
    WHERE id IN (
      SELECT language_id
      FROM project_language
      WHERE project_id IN (
        SELECT project_id
        FROM namespace
        WHERE id = ${id}
      )
    )
    `;
    logger.info(`query2 is ${languageQuery}`);
    const language: any[] = await this.namespaceRepository.query(languageQuery);

    const referenceLanguageQuery = `
    SELECT *
    FROM language
    WHERE id IN (
      SELECT reference_language_id
      FROM project
      WHERE id = (
        SELECT project_id
        FROM namespace
        WHERE id = ${id}
      )
    )
    `;
    const referenceLanguage: any[] = await this.namespaceRepository.query(referenceLanguageQuery);
    language.forEach(ele => {
      if (ele.id === referenceLanguage[0].id) {
        ele.referenceLanguage = true;
      }
    });
    return language;
  }

  async getKeysByCondition(namespaceViewDetail: NamespaceViewDetail): Promise<any> {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const namespaceId = namespaceViewDetail.namespaceId;
    const referenceLanguageId = namespaceViewDetail.referenceLanguageId;
    const targetLanguageId = namespaceViewDetail.targetLanguageId;
    const page = namespaceViewDetail.page;
    const pageSize = namespaceViewDetail.pageSize;
    let condition = namespaceViewDetail.condition;
    // eslint-disable-next-line @typescript-eslint/quotes
    condition = condition.replace("'", "\\'");
    const keyTranslateProgressStatus = namespaceViewDetail.KeyTranslateProgressStatus;
    const branchId = namespaceViewDetail.branchId;
    const offset = (page - 1) * pageSize;
    let statusCondition = '';
    if (keyTranslateProgressStatus.toLowerCase() === 'all') {
      statusCondition = '';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'unfinished') {
      statusCondition = 'WHERE valueId IS NULL';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'finished') {
      statusCondition = 'WHERE valueId IS NOT NULL';
    } else {
      statusCondition = '';
    }
    // 获取target language key
    let pageCondition = `LIMIT ${pageSize} OFFSET ${offset}`;
    let namespaceKeys: any[] = await this.getNamespaceTargetLanguageKeys(
      namespaceId,
      condition,
      targetLanguageId,
      statusCondition,
      pageCondition,
      branchId,
    );

    // namespaceKeys = namespaceKeys.filter(t => t.keynameid === t.actualid);
    // 获取总数
    pageCondition = '';
    let namespaceAllKeys: any[] = await this.getNamespaceTargetLanguageKeys(
      namespaceId,
      condition,
      targetLanguageId,
      statusCondition,
      pageCondition,
      branchId,
    );

    //namespaceAllKeys = namespaceAllKeys.filter(t => t.keynameid === t.actualid);
    const totalNum = namespaceAllKeys.length;
    let keyidlist = [];
    let retNsKey = [];
    if (referenceLanguageId === targetLanguageId) {
      for (const namespaceKey of namespaceKeys) {
        const kid = namespaceKey.keyid;
        const kn = namespaceKey.keyname;
        const lg = namespaceKey.languageid === null ? targetLanguageId : namespaceKey.languageid;
        const kv = namespaceKey.keyvalue;
        const vue = namespaceKey.valueid;
        const targetLanguageValue = {
          valueId: vue,
          keyValue: kv,
          languageId: lg,
        };
        const value = {
          keyId: kid,
          keyName: kn,
          refreLanguageValue: targetLanguageValue,
          targetLanguageValue,
        };
        retNsKey.push(value);
      }
    } else {
      if (namespaceKeys.length > 0) {
        for (const nskey of namespaceKeys) {
          keyidlist.push(nskey.keyid);
        }
        const query2 = `
        SELECT kkk.keyId AS keyId, kkk.keyNameId AS keyNameId, kkk.keyName AS keyName, kkk.id AS valueId, kkk.language_id AS languageId
          , kkk.value AS keyValue
        FROM (
          SELECT *
          FROM (
            SELECT knt.keyNameId, knt.keyId, knt.keyName
            FROM (
              SELECT kn.id AS keyNameId, kn.key_id AS keyId, kn.name AS keyName
              FROM keyname kn
              WHERE key_id IN (${keyidlist.join(',')})
            ) knt
          ) kntt
            LEFT JOIN (
              SELECT *
              FROM keyvalue
              WHERE language_id = ${referenceLanguageId}
            ) kv
            ON kntt.keyId = kv.key_id
        ) kkk`;
        // logger.info(`query2 is ${query2}`);
        const namespaceRefKeys: any[] = await this.namespaceRepository.query(query2);
        const map = new Map();
        for (const namespaceRefKey of namespaceRefKeys) {
          const keyId = namespaceRefKey.keyid;
          const valueId = namespaceRefKey.valueid;
          const keyValue = namespaceRefKey.keyvalue;
          const languageId = namespaceRefKey.languageid === null ? referenceLanguageId : namespaceRefKey.languageid;
          const value = {
            valueId,
            keyValue,
            languageId,
          };
          map.set(keyId, value);
        }
        for (const namespaceKey of namespaceKeys) {
          const kid = namespaceKey.keyid;
          const kn = namespaceKey.keyname;
          let lg = namespaceKey.languageid;
          const kv = namespaceKey.keyvalue;
          const vue = namespaceKey.valueid;
          const refreLanguageValue = map.get(kid);
          const targetLanguageValue = {
            valueId: vue,
            keyValue: kv,
            languageId: lg === null ? targetLanguageId : lg,
          };
          const value = {
            keyId: kid,
            keyName: kn,
            refreLanguageValue,
            targetLanguageValue,
          };
          retNsKey.push(value);
        }
      }
    }
    // 返回结果添加 branch id
    retNsKey.forEach(item => {
      item.branchId = branchId;
    });
    const result = {
      keys: retNsKey,
      totalNum,
    };
    return result;
  }

  async getAllKeysByCondition(namespaceViewDetail: NamespaceViewDetail): Promise<Array<any>> {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const namespaceId = namespaceViewDetail.namespaceId;
    const referenceLanguageId = namespaceViewDetail.referenceLanguageId;
    const targetLanguageId = namespaceViewDetail.targetLanguageId;
    let condition = namespaceViewDetail.condition;
    // 需要处理 condition 中包含 ' 的情况
    // eslint-disable-next-line @typescript-eslint/quotes
    condition = condition.replace("'", "\\'");
    const keyTranslateProgressStatus = namespaceViewDetail.KeyTranslateProgressStatus;
    const branchId = namespaceViewDetail.branchId;
    let statusCondition = '';
    if (keyTranslateProgressStatus.toLowerCase() === 'all') {
      statusCondition = '';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'unfinished') {
      statusCondition = 'WHERE valueId IS NULL';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'finished') {
      statusCondition = 'WHERE valueId IS NOT NULL';
    } else {
      statusCondition = '';
    }
    // 获取target language key
    let pageCondition = '';
    let namespaceKeys: any[] = await this.getNamespaceTargetLanguageKeys(
      namespaceId,
      condition,
      targetLanguageId,
      statusCondition,
      pageCondition,
      branchId,
    );

    let keyidlist = [];
    let retNsKey = [];
    if (referenceLanguageId === targetLanguageId) {
      for (const namespaceKey of namespaceKeys) {
        const kid = namespaceKey.keyid;
        const kn = namespaceKey.keyname;
        const lg = namespaceKey.languageid === null ? targetLanguageId : namespaceKey.languageid;
        const kv = namespaceKey.keyvalue;
        const vue = namespaceKey.valueid;
        const targetLanguageValue = {
          valueId: vue,
          keyValue: kv,
          languageId: lg,
        };
        const value = {
          keyId: kid,
          keyName: kn,
          refreLanguageValue: targetLanguageValue,
          targetLanguageValue,
          branchId,
        };
        retNsKey.push(value);
      }
    } else {
      if (namespaceKeys.length > 0) {
        for (const nskey of namespaceKeys) {
          keyidlist.push(nskey.keyid);
        }
        const query2 = `
        SELECT kkk.keyId AS keyId, kkk.keyNameId AS keyNameId, kkk.keyName AS keyName, kkk.id AS valueId, kkk.language_id AS languageId
          , kkk.value AS keyValue
        FROM (
          SELECT *
          FROM (
            SELECT knt.keyNameId, knt.keyId, knt.keyName
            FROM (
              SELECT kn.id AS keyNameId, kn.key_id AS keyId, kn.name AS keyName
              FROM keyname kn
              WHERE key_id IN (${keyidlist.join(',')})
            ) knt
          ) kntt
            LEFT JOIN (
              SELECT *
              FROM keyvalue
              WHERE language_id = ${referenceLanguageId}
            ) kv
            ON kntt.keyId = kv.key_id
        ) kkk`;
        // logger.info(`query2 is ${query2}`);
        const namespaceRefKeys: any[] = await this.namespaceRepository.query(query2);
        const map = new Map();
        for (const namespaceRefKey of namespaceRefKeys) {
          const keyId = namespaceRefKey.keyid;
          const valueId = namespaceRefKey.valueid;
          const keyValue = namespaceRefKey.keyvalue;
          const languageId = namespaceRefKey.languageid === null ? referenceLanguageId : namespaceRefKey.languageid;
          const value = {
            valueId,
            keyValue,
            languageId,
          };
          map.set(keyId, value);
        }
        for (const namespaceKey of namespaceKeys) {
          const kid = namespaceKey.keyid;
          const kn = namespaceKey.keyname;
          let lg = namespaceKey.languageid;
          const kv = namespaceKey.keyvalue;
          const vue = namespaceKey.valueid;
          const refreLanguageValue = map.get(kid);
          const targetLanguageValue = {
            valueId: vue,
            keyValue: kv,
            languageId: lg === null ? targetLanguageId : lg,
          };
          const value = {
            keyId: kid,
            keyName: kn,
            refreLanguageValue,
            targetLanguageValue,
            branchId,
          };
          retNsKey.push(value);
        }
      }
    }
    return retNsKey;
  }

  async getNamespaceTargetLanguageKeys(
    namespaceId,
    searchCondition,
    targetLanguageId,
    statusCondition,
    pageCondition,
    branchId,
  ) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const query = `
    SELECT *
    FROM (
      SELECT keyid, keynameid, keyname, valueid, languageid
        , keyvalue, actualid
      FROM ((
        SELECT *
        FROM (
          SELECT k.id AS keyid, k.actual_id AS actualid
          FROM key k
          WHERE k.delete = 'f'
            AND namespace_id = ${namespaceId}
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
            WHERE name LIKE '%${searchCondition}%' and latest = true
          ) s3
          ON s2.key_id = s3.key_id) s4
          LEFT JOIN (
            SELECT kv.id AS valueid, kv.language_id AS languageid, key_id, kv.value AS keyvalue
            FROM keyvalue kv
            WHERE language_id = ${targetLanguageId}
              AND latest = true
          ) s5
          ON s4.keyid = s5.key_id
      ) s6
      -- WHERE keynameid = actualid
    ) s7
    ${statusCondition}
    ORDER BY keyName ASC
    ${pageCondition}
    `;
    logger.info(`getNamespaceTargetLanguageKeys is ${query}`);
    return await this.namespaceRepository.query(query);
  }
  async findAll(): Promise<Namespace[]> {
    return await this.namespaceRepository.find();
  }

  async findByProjectId(projectId: number): Promise<Namespace[]> {
    return await this.namespaceRepository.find({ projectId, delete: false });
  }

  async count() {
    return await this.namespaceRepository.count();
  }

  async findProject(namespaceId: number): Promise<Project> {
    const q = `select * from project where id=(SELECT project_id FROM "namespace" where id=${namespaceId})`;
    return await this.namespaceRepository.query(q);
  }

  async save(vo: Namespace) {
    const project = await this.projectRepository.findOne(vo.projectId);
    if (project === undefined || project.delete) {
      throw new BadRequestException(ErrorMessage.PROJECT_NOT_EXIST);
    }

    vo.delete = false;
    vo.modifyTime = new Date();
    vo.name = vo.name.trim();
    this.namespaceRepository.save(vo);
  }

  async getKeyDetailInfo(keyId: number) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const query1 = `select * from keyname where key_id= ${keyId}`;
    const keyName = await this.keynameRepository.query(query1);
    let keyNameTrue: any;
    if (keyName.length > 1) {
      const aa = keyName.sort((a, b) => b.modify_time - a.modify_time);
      keyNameTrue = aa[0];
    } else {
      keyNameTrue = keyName[0];
    }
    logger.info(`key name: ${keyName}, ${keyNameTrue}`);
    const query2 = `
    SELECT *
    FROM (
      SELECT *
      FROM keyvalue
      WHERE key_id = ${keyId}
        AND latest = true
    ) t1
      RIGHT JOIN (
        SELECT *
        FROM (
          SELECT language_id
          FROM project_language
          WHERE project_id = (
            SELECT project_id
            FROM "namespace"
            WHERE id = (
              SELECT namespace_id
              FROM key
              WHERE id = ${keyId}
            )
          )
        ) t3
      ) t2
      ON t1.language_id = t2.language_id
    `;
    const keyValue = await this.keynameRepository.query(query2);
    const result = {
      keyName: keyNameTrue,
      value: keyValue,
    };
    return result;
  }

  async getDefaultBranchIdByNsid(nnid: number): Promise<Branch> {
    const query = `select * from branch where project_id =(SELECT project_id from namespace where id = ${nnid})`;
    const result: Branch = await this.namespaceRepository.query(query);
    return result[0];
  }

  async syncOldData(onid: number, nnid: number, ckcode: number): Promise<string> {
    /**
     * 1.ckcode： 用于接口调用校验
     * 2.onid: 老的数据的namespace id, 获取json 中的数据，根据 onid 筛选
     * 3.nnid: 新的数据的 namespace id, 需要根据此id 获取 branch id, 此id在页面创建 namespace的时候会创建
     */
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    onid = Number.parseInt(onid.toString());
    if (ckcode.toString() !== '123321') {
      throw ErrorMessage.NO_PERMISSION;
    }
    const syncDataPath = this.config.get('sync', 'path');
    let records = [];
    if (fs.existsSync(syncDataPath)) {
      const allKv = JSON.parse(fs.readFileSync(syncDataPath, 'utf8'));
      records = allKv.RECORDS;
      logger.info(`sync: find all item count is ${records.length}`);
    } else {
      logger.error(`sync: not find file, file path is ${syncDataPath}`);
      throw ErrorMessage.KEY_NOT_EXIST;
    }
    // 根据传入的 namespace id 过滤数据
    const filterRecords = records.filter(item => item.namespaceId === onid);
    logger.info(`sync: find filter item count is ${filterRecords.length}`);
    // 组装入库数据
    const branch: Branch = await this.getDefaultBranchIdByNsid(nnid);
    const branchId = branch.id;
    logger.info(`sync: branch id is ${branchId}`);
    // const modifier = 'system_sync_admin';
    // const modifyTime = modifyTime.toUTCString();
    // 获取 language id 对应map
    const languages: Language[] = await this.getAllLanguage();
    const languageMap = new Map();
    languages.forEach(item => {
      languageMap.set(item.name, item.id);
    });
    let handleRecords = new Map();
    filterRecords.forEach(item => {
      const key = item.key;
      const value = item.value;
      const language = item.language;
      const languageId = languageMap.get(language);
      if (handleRecords.has(key)) {
        const a = handleRecords.get(key);
        a.push({ value, languageId });
        handleRecords.set(key, a);
      } else {
        handleRecords.set(key, [{ value, languageId }]);
      }
    });

    // for (const [k, v] of handleRecords) {
    //   try {
    //     logger.info(`start to sync key name: ${k}`);
    //     await this.editKeyValue(branchId, nnid, null, k, v, 'system_admin_sync', new Date());
    //   } catch (error) {
    //     logger.error(`sync old data error, details : ${error}`);
    //   }
    // }
    handleRecords.forEach(async (v, k) => {
      try {
        logger.info(`start to sync key name: ${k}`);
        await this.editKeyValue(branchId, nnid, null, k, v, 'system_admin_sync', new Date());
      } catch (error) {
        logger.error(`sync old data error, details : ${error}`);
      }
    });
    logger.info(`sync old namespace: ${onid} to new namespace: ${nnid} successful!`);
    return 'sync success';
  }
  async getAllLanguage(): Promise<Language[]> {
    const query = 'select * from language';
    const result: Language[] = await this.namespaceRepository.query(query);
    return result;
  }

  async checkKeyIsExist(branchId, keyName, namespaceId): Promise<boolean> {
    const sameKeyName = `
        SELECT *
          FROM branch_key
          WHERE (branch_id = ${branchId}
            AND key_id IN (
              SELECT id
              FROM key
              WHERE id IN (
                  SELECT key_id
                  FROM keyname
                  WHERE name = '${keyName}' and namespace_id = '${namespaceId}' and latest = true
                )
                AND delete IS false
            )
            AND delete IS false)
        `;
    // logger.info(`sameKeyName: ${sameKeyName}`);
    const sameNameValid = await this.keyRepository.query(sameKeyName);
    if (sameNameValid.length > 0) {
      return true;
    }
    return false;
  }
}
