/* eslint-disable max-len */
/* eslint-disable no-multi-str */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
    // todo
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
    // const connection = getConnection();
    // const queryRunner = connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    try {
      const keyNameInfo = await this.keyRepository.query(`select * from keyname where key_id = ${keyId}`);
      if (keyNameInfo.filter(a => a.name === keyName.trim()).length > 0) {
        throw new Error(`Key id get name is equals key name ${keyName}`);
      }
      // key 表不动，key name 增加，key value 增加
      // todo branch commit record
      const commitId = UUIDUtils.generateUUID();
      const keyNameEntity = new Keyname();
      keyNameEntity.keyId = keyId;
      keyNameEntity.modifier = 'lw'; // todo modifier ??
      keyNameEntity.modifyTime = new Date();
      keyNameEntity.name = keyName.trim();
      keyNameEntity.commitId = commitId;
      const insertKeyName = await this.keynameRepository.insert(keyNameEntity);
      const keyNameId = insertKeyName.raw[0].id;
      logger.info(`insert key name id: ${keyNameId}`);
      // key value
      const keyvalueInfo = await this.keyvalueRepository.query(
        `select * from keyvalue where key_id = ${keyId} and latest is true`,
      );
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
        keyValueEntity.modifier = 'lw';
        keyValueEntity.midifyTime = new Date();
        keyValueEntitys.push(keyValueEntity);
      });
      await this.keyvalueRepository.insert(keyValueEntitys);
      // 更新 key 表actual id 为 key name id
      this.keyRepository.query(`update key set actual_id=${keyNameId} where id=${keyId}`);

      const reskeynameInfo = this.keynameRepository.query(`select * from keyname where id = ${keyNameId}`);
      //await queryRunner.commitTransaction();
      return reskeynameInfo;
    } catch (error) {
      //await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    }
  }

  async editKeyValue(branchId: any, namespaceId: any, keyId: any, keyName: any, data: any) {
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
    try {
      if (keyId === '' || keyId === null) {
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
        const insertKey = await this.keyRepository.insert(keyEntity);
        const keyEntityId = insertKey.raw[0].id;
        logger.info(`insert key id: ${keyEntityId}`);
        // 插入branch commit
        const branchCommit = new BranchCommit();
        branchCommit.type = CommonConstant.COMMIT_TYPE_ADD;
        branchCommit.commitId = commitId;
        branchCommit.branchId = branchId;
        branchCommit.commitTime = new Date();
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
        keyNameEntity.modifier = 'lw';
        keyNameEntity.modifyTime = new Date();
        keyNameEntity.name = keyName;
        keyNameEntity.commitId = commitId;
        // throw new Error('test transaction.');
        const insertKeyName = await this.keynameRepository.insert(keyNameEntity);
        const keyNameId = insertKeyName.raw[0].id;
        logger.info(`insert key name id: ${keyNameId}`);
        this.keyRepository.query(`update key set actual_id=${keyNameId} where id=${keyEntityId}`);
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
            keyValueEntity.modifier = 'lw'; // todo modifier ??
            keyValueEntity.midifyTime = new Date();
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
        branchCommit.commitTime = new Date();
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
            keyValueEntity.modifier = 'lw'; // todo modifier ??
            keyValueEntity.midifyTime = new Date();
            keyValueEntitys.push(keyValueEntity);
          }
        });
        await this.keyvalueRepository.insert(keyValueEntitys);
      }
      //await queryRunner.commitTransaction();
    } catch (error) {
      //await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    }
  }

  async editKeyValueOnlanguage(
    branchId: number,
    languageId: number,
    keyId: number,
    keyvalue: string,
    valueId: number | undefined,
  ) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    logger.info(languageId, keyId, keyvalue);

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

    /* todo
        Every time change keyvalue, you need to set the latest for the previous version of keyvalue to false,
        and the newest keyvalue is true, and commit the branch-commit record*/
    const branchCommit = new BranchCommit();
    branchCommit.type = CommonConstant.COMMIT_TYPE_CHANGE;
    branchCommit.commitId = UUIDUtils.generateUUID();
    branchCommit.branchId = branchId;
    branchCommit.commitTime = new Date();
    await this.branchCommitRepository.save(branchCommit);

    if (valueId !== undefined && valueId !== null) {
      const value = await this.keyvalueRepository.findOne(valueId);
      if (value !== undefined) {
        if (!value.latest) {
          throw new BadRequestException(ErrorMessage.VALUE_CHANGED);
        } else {
          value.latest = false;
          value.midifyTime = new Date();
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
    return await this.keyvalueRepository.insert(newValue);
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
    const condition = namespaceViewDetail.condition;
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
    SELECT * from (
    SELECT *
    FROM (
      SELECT kkk.keyId AS keyId, kkk.keyNameId AS keyNameId, kkk.keyName AS keyName, kkk.id AS valueId, kkk.language_id AS languageId
        , kkk.value AS keyValue, kkk.actualId AS actualId
      FROM (
        SELECT *
        FROM (
          SELECT kkn.keyid AS keyId, kkn.id AS keyNameId, kkn.name AS keyName, kkn.actualid AS actualId
          FROM ((
            SELECT *
            FROM (
              SELECT k.id AS keyid, k.actual_id AS actualid
              FROM key k
              WHERE k.delete = 'f'
                AND namespace_id = ${namespaceId}
            ) kt
              JOIN (
                SELECT key_id
                FROM branch_key
                WHERE branch_id = ${branchId}
              ) bk
              ON kt.keyid = bk.key_id
          ) kbt
            JOIN keyname kn ON kbt.keyid = kn.key_id) kkn
          WHERE kkn.name LIKE '%${searchCondition}%'
        ) kknt
          LEFT JOIN (
            SELECT *
            FROM keyvalue
            WHERE language_id = ${targetLanguageId} and latest = true
          ) kv
          ON kknt.keyid = kv.key_id
      ) kkk
    ) kkkt where actualId=keyNameId
    ) ret
    ${statusCondition}
    ORDER BY keyName ASC
    ${pageCondition}
    `;
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
}
