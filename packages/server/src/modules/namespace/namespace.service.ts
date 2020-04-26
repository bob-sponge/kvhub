/* eslint-disable max-len */
/* eslint-disable no-multi-str */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/entities/Namespace';
import { Repository } from 'typeorm';
import { NamespaceViewDetail } from 'src/vo/NamespaceViewDetail';
import * as Log4js from 'log4js';

@Injectable()
export class NamespaceService {
  constructor(
    @InjectRepository(Namespace)
    private readonly namespaceRepository: Repository<Namespace>,
  ) {}

  async getKeysByCondition(namespaceViewDetail: NamespaceViewDetail): Promise<any[]> {
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
         WHERE kkn.name LIKE '%${condition}%'
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
   LIMIT ${pageSize} OFFSET ${offset}`;
    logger.info(`query is ${query}`);
    const namespaceKeys: any[] = await this.namespaceRepository.query(query);
    let keyidlist = [];
    let retNsKey = [];
    if (referenceLanguageId === targetLanguageId) {
      for (const namespaceKey of namespaceKeys) {
        const kid = namespaceKey.keyid;
        const kn = namespaceKey.keyname;
        const lg = namespaceKey.languageid;
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
          const languageId = namespaceRefKey.languageid;
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
          const lg = namespaceKey.languageid;
          const kv = namespaceKey.keyvalue;
          const vue = namespaceKey.valueid;
          const refreLanguageValue = map.get(kid);
          const targetLanguageValue = {
            valueId: vue,
            keyValue: kv,
            languageId: lg,
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
    return retNsKey;
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
}
