/* eslint-disable max-len */
/* eslint-disable no-multi-str */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Repository, getConnection } from 'typeorm';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import * as Log4js from 'log4js';
import { Keyvalue } from 'src/entities/Keyvalue';
import { BranchKey } from 'src/entities/BranchKey';
import { Keyname } from 'src/entities/Keyname';
import { Key } from 'src/entities/Key';
import { Branch } from 'src/entities/Branch';
import { UUIDUtils } from 'src/utils/uuid';

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
  ) {}

  async deleteNamespace(namespaceId: number) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const modifier = 'lw';
    const modifyTime = new Date().toUTCString(); // TODO: 时间不一致
    const q = `update namespace set delete=true, modifier='${modifier}', modify_time='${modifyTime}' where id=${namespaceId}`;
    logger.info(`q: ${q}`);
    await this.namespaceRepository.query(q);
  }

  async deleteKey(keyId: number) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const modifier = 'lw';
    const modifyTime = new Date().toUTCString();
    const q = `update key set delete=true, modifier='${modifier}', modify_time='${modifyTime}' where id=${keyId}`;
    logger.info(`q: ${q}`);
    await this.keyRepository.query(q);
  }

  async editKeyname(keyId: any, keyName: any) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';

    // 开启事务
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const keyNameInfo = await this.keyRepository.query(`select * from keyname where key_id = ${keyId}`);
      if (keyNameInfo.filter(a => a.name === keyName).length > 0) {
        throw new Error(`Key id get name is equals key name ${keyName}`);
      }
      // key 表不动，key name 增加，key value 增加
      const commitId = UUIDUtils.generateUUID();
      const keyNameEntity = new Keyname();
      keyNameEntity.keyId = keyId;
      keyNameEntity.modifier = 'lw';
      keyNameEntity.modifyTime = new Date();
      keyNameEntity.name = keyName;
      keyNameEntity.commitId = commitId;
      const insertKeyName = await queryRunner.manager.insert<Keyname>(Keyname, keyNameEntity);
      logger.info(`insert key name id: ${insertKeyName.raw[0].id}`);
      // key value
      const keyvalueInfo = await this.keyvalueRepository.query(
        `select * from keyvalue where key_id = ${keyId} and latest is true`,
      );
      // 更新 value 表的 latest 为false
      await queryRunner.manager.query(`UPDATE keyvalue SET latest = false WHERE key_id = ${keyId}`);
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
        keyValueEntity.modifier = 'lw';
        keyValueEntity.midifyTime = new Date();
        keyValueEntitys.push(keyValueEntity);
      });
      await queryRunner.manager.insert<Keyvalue>(Keyvalue, keyValueEntitys);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    }
  }

  async editKeyValue(branchId: any, namespaceId: any, keyId: any, keyName: any, data: any) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';

    // 开启事务
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (keyId === '') {
        // 新增
        // 判断当前分支下是否有同名的 key name, 有抛出异常， 不能保存成功
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
                  WHERE name = '${keyName}'
                )
                AND delete IS false
            )
            AND delete IS false)
        `;
        logger.info(`sameKeyName: ${sameKeyName}`);
        const sameNameValid = await this.keyRepository.query(sameKeyName);
        const branchName = await this.branchRepository.query(`SELECT name FROM branch WHERE id = ${branchId}`);
        if (sameNameValid.length > 0) {
          throw new Error(`Key name already exist on branch ${branchName[0].name} .`);
        }
        // 插入key 表, 获取 key id.
        const keyEntity = new Key();
        keyEntity.modifier = 'lw'; // TODO: <@liuwang> 根据会话获取当前用户
        keyEntity.namespaceId = namespaceId;
        keyEntity.modifyTime = new Date();
        keyEntity.delete = false;
        keyEntity.actualId = 0;
        const insertKey = await queryRunner.manager.insert<Key>(Key, keyEntity);
        const keyEntityId = insertKey.raw[0].id;
        logger.info(`insert key id: ${keyEntityId}`);
        // 处理其他的关联表
        // 插入 key branch 表
        const branchKeyEntity = new BranchKey();
        branchKeyEntity.branchId = branchId;
        branchKeyEntity.keyId = keyEntityId;
        branchKeyEntity.delete = false;
        await queryRunner.manager.insert<BranchKey>(BranchKey, branchKeyEntity);
        // 插入keyName 表,
        const commitId = UUIDUtils.generateUUID();
        const keyNameEntity = new Keyname();
        keyNameEntity.keyId = keyEntityId;
        keyNameEntity.modifier = 'lw';
        keyNameEntity.modifyTime = new Date();
        keyNameEntity.name = keyName;
        keyNameEntity.commitId = commitId;
        // throw new Error('test transaction.');
        const insertKeyName = await queryRunner.manager.insert<Keyname>(Keyname, keyNameEntity);
        logger.info(`insert key name id: ${insertKeyName.raw[0].id}`);
        // 插入key Value 表,
        let keyValueEntitys = [];
        data.forEach(d => {
          const languageId = d.languageId;
          const value = d.value;
          const keyValueEntity = new Keyvalue();
          keyValueEntity.value = value;
          keyValueEntity.keyId = keyEntityId;
          keyValueEntity.commitId = commitId;
          keyValueEntity.languageId = languageId;
          keyValueEntity.latest = true;
          keyValueEntity.modifier = 'lw';
          keyValueEntity.midifyTime = new Date();
          keyValueEntitys.push(keyValueEntity);
        });
        await queryRunner.manager.insert<Keyvalue>(Keyvalue, keyValueEntitys);
      } else {
        // 編輯
        // 根据 key id 查询比较
        const keyNameInfo = await this.keyRepository.query(`select * from keyname where key_id = ${keyId}`);
        const keyIdGetName = keyNameInfo[0].name;
        if (keyIdGetName !== keyName) {
          throw new Error(`Key id get name ${keyIdGetName} not equals key name ${keyName}`);
        }
        // 更新 value 表的 latest 为false
        await queryRunner.manager.query(`UPDATE keyvalue SET latest = false WHERE key_id = ${keyId}`);
        // 插入key Value 表,
        let keyValueEntitys = [];
        const commitId = UUIDUtils.generateUUID();
        data.forEach(d => {
          const languageId = d.languageId;
          const value = d.value;
          const keyValueEntity = new Keyvalue();
          keyValueEntity.value = value;
          keyValueEntity.keyId = keyId;
          keyValueEntity.commitId = commitId;
          keyValueEntity.languageId = languageId;
          keyValueEntity.latest = true;
          keyValueEntity.modifier = 'lw';
          keyValueEntity.midifyTime = new Date();
          keyValueEntitys.push(keyValueEntity);
        });
        await queryRunner.manager.insert<Keyvalue>(Keyvalue, keyValueEntitys);
      }
      await await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    }
  }

  async editKeyValueOnlanguage(languageId: number, keyId: number, keyvalue: string) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    logger.info(languageId, keyId, keyvalue);
    const value = new Keyvalue();
    value.keyId = keyId;
    value.languageId = languageId;
    value.value = keyvalue;
    return await this.keyvalueRepository.insert(value);
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
    const condition = namespaceViewDetail.condition;
    const keyTranslateProgressStatus = namespaceViewDetail.KeyTranslateProgressStatus;
    const offset = (page - 1) * pageSize;
    let statusCondition = '';
    if (keyTranslateProgressStatus.toLowerCase() === 'all') {
      statusCondition = '';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'unfinish') {
      statusCondition = 'WHERE valueId IS NULL';
    } else if (keyTranslateProgressStatus.toLowerCase() === 'finish') {
      statusCondition = 'WHERE valueId IS NOT NULL';
    } else {
      statusCondition = '';
    }
    // 获取target language key
    let pageCondition = `LIMIT ${pageSize} OFFSET ${offset}`;
    const namespaceKeys: any[] = await this.getNamespaceTargetLanguageKeys(
      namespaceId,
      condition,
      targetLanguageId,
      statusCondition,
      pageCondition,
    );
    // 获取总数
    pageCondition = '';
    const namespaceAllKeys: any[] = await this.getNamespaceTargetLanguageKeys(
      namespaceId,
      condition,
      targetLanguageId,
      statusCondition,
      pageCondition,
    );
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
        logger.info(`query2 is ${query2}`);
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
    const result = {
      keys: retNsKey,
      totalNum,
    };
    return result;
  }

  async getNamespaceTargetLanguageKeys(namespaceId, searchCondition, targetLanguageId, statusCondition, pageCondition) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    const query = `SELECT *
    FROM (
     SELECT kkk.keyId AS keyId, kkk.keyNameId AS keyNameId, kkk.keyName AS keyName, kkk.id AS valueId, kkk.language_id AS languageId\
       , kkk.value AS keyValue
     FROM (
       SELECT *
       FROM (
         SELECT kkn.keyid AS keyId, kkn.id AS keyNameId, kkn.name AS keyName
         FROM (
           SELECT *
           FROM (
             SELECT k.id AS keyid
             FROM key k
             WHERE k.delete = 'f'
               AND namespace_id = ${namespaceId}
           ) kt
             JOIN keyname kn ON kt.keyid = kn.key_id
         ) kkn
         WHERE kkn.name LIKE '%${searchCondition}%'
       ) kknt
         LEFT JOIN (
           SELECT *
           FROM keyvalue
           WHERE language_id = ${targetLanguageId}
         ) kv
         ON kknt.keyid = kv.key_id
     ) kkk
   ) kkkt
   ${statusCondition}
   ORDER BY keyName ASC
   ${pageCondition}`;
    logger.info(`query is ${query}`);
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

  async save(vo: Namespace) {
    vo.delete = false;
    vo.modifyTime = new Date();
    this.namespaceRepository.save(vo);
  }
}
