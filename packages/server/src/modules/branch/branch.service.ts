/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository, DeleteResult, Like, In } from 'typeorm';
import { Project } from 'src/entities/Project';
import { ConfigService } from '@ofm/nestjs-utils';
import { BranchPage } from 'src/vo/Page';
import { PageResult } from 'src/vo/PageResult';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchKey } from 'src/entities/BranchKey';
import { BranchBody } from 'src/vo/BranchBody';
import { BranchVO } from 'src/vo/BranchVO';
import { CompareVO } from 'src/vo/CompareVO';
import { MergeDiffChangeKey } from 'src/entities/MergeDiffChangeKey';
import { CompareBranchVO } from 'src/vo/CompareBranchVO';
import { ErrorMessage, CommonConstant } from 'src/constant/constant';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { UUIDUtils } from 'src/utils/uuid';
import { BranchCommit } from 'src/entities/BranchCommit';
import { Namespace } from 'src/entities/Namespace';
import { KeyService } from 'src/modules/key/key.service';
import { KeyValueDetailVO } from 'src/vo/KeyValueDetailVO';
import { CompareKeyVO } from 'src/vo/CompareKeyVO';
import { ValueVO } from 'src/vo/ValueVO';
import { CompareValueVO } from 'src/vo/CompareValueVO';

@Injectable()
export class BranchService {
  private constant: Map<string, string>;
  constructor(
    @InjectRepository(Key) private readonly keyRepository: Repository<Key>,
    @InjectRepository(Keyname) private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Keyvalue) private readonly keyvalueRepository: Repository<Keyvalue>,
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchKey) private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(BranchMerge) private readonly branchMergeRepository: Repository<BranchMerge>,
    @InjectRepository(BranchCommit) private readonly branchCommitRepository: Repository<BranchCommit>,
    @InjectRepository(MergeDiffChangeKey) private readonly mergeDiffChangeKeyRepository: Repository<MergeDiffChangeKey>,
    @InjectRepository(Namespace) private readonly namespaceRepository: Repository<Namespace>,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => KeyService))
    private readonly keyService: KeyService,
  ) {
    this.constant = new Map([
      ['0', 'Open'],
      ['1', 'Merged'],
    ]);
  }

  /**
   * 查询全部branch
   */
  async findAllBranch(): Promise<Branch[]> {
    return await this.branchRepository.find();
  }

  /**
   * 不同branch间key的value比较
   * @param compareVO compareVO
   */
  async compare(compareVO: CompareVO): Promise<CompareBranchVO[]> {
    let crosMerge = false;
    if (compareVO.crosMerge !== undefined && compareVO.crosMerge) {
      crosMerge = true;
    }
    const ids = [compareVO.source, compareVO.destination];
    const branchs: Branch[] = await this.branchRepository.findByIds(ids);
    if (branchs !== null && branchs.length !== 2) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    }

    // get source and target branch id
    const sourceBranchId = compareVO.source;
    const targetBranchId = compareVO.destination;

    // By branch id, get the key corresponding to the branch and the name and value corresponding to the key
    let sourceKeyList = await this.keyService.getKeyListByBranchId(sourceBranchId);
    let targetKeyList = await this.keyService.getKeyListByBranchId(targetBranchId);

    return await this.diffKey(sourceKeyList, targetKeyList, crosMerge);
  }

  /**
   * When the actualId of the key is equal, compare the name and values of the key
   * @param source Source branches all keys, key names and their translations in different languages
   * @param target Target branches all keys, key names and their translations in different languages
   * @param mergeId branch merge id
   */
  private async diffKey(
    source: KeyValueDetailVO[],
    target: KeyValueDetailVO[],
    crosMerge: boolean,
  ): Promise<CompareBranchVO[]> {
    let result: CompareBranchVO[] = [];

    for (const item of source) {
      let targetKey = new KeyValueDetailVO();
      const compareBranchVO = new CompareBranchVO();
      const sourceCompare = new CompareKeyVO();
      const targetCompare = new CompareKeyVO();
      const sourceKey = item;
      // 如果在目标分支找不到 和源分支keyname 一样的，则表明diff 值只存在原始分支
      const existedTargetKey = target.find(m => m.keyName === item.keyName && m.namespaceId === item.namespaceId);
      if (existedTargetKey === undefined) {
        // 表明不存在，只返回源
        sourceCompare.keyId = sourceKey.keyId;
        sourceCompare.keyname = sourceKey.keyName;
        const sNamespace = await this.namespaceRepository.findOne(sourceKey.namespaceId);
        if (sNamespace !== undefined && !sNamespace.delete) {
          sourceCompare.namespaceName = sNamespace.name;
        }
        const sourceValueList: CompareValueVO[] = [];
        if (sourceKey.valueList !== null && sourceKey.valueList.length > 0) {
          sourceKey.valueList.forEach(v => {
            const diffValue = new CompareValueVO();
            diffValue.languageId = v.languageId;
            diffValue.valueId = v.valueId;
            diffValue.value = v.value;
            diffValue.language = v.languageName;
            sourceValueList.push(diffValue);
          });
        }
        sourceCompare.valueList = sourceValueList;
        compareBranchVO.source = sourceCompare;
        compareBranchVO.target = targetCompare;
        result.push(compareBranchVO);
      } else {
        // 表明存在
        targetKey = existedTargetKey;
        const valueCheck = this.checkValueVO(sourceKey.valueList, targetKey.valueList);
        if (!valueCheck) {
          sourceCompare.keyId = sourceKey.keyId;
          sourceCompare.keyname = sourceKey.keyName;
          const sNamespace = await this.namespaceRepository.findOne(sourceKey.namespaceId);
          if (sNamespace !== undefined && !sNamespace.delete) {
            sourceCompare.namespaceName = sNamespace.name;
          }
          if (targetKey !== null) {
            targetCompare.keyId = targetKey.keyId;
            targetCompare.keyname = targetKey.keyName;
            if (targetKey.namespaceId !== undefined) {
              const tNamespace = await this.namespaceRepository.findOne(targetKey.namespaceId);
              if (tNamespace !== undefined && !tNamespace.delete) {
                targetCompare.namespaceName = tNamespace.name;
              }
            }
          }
          const sourceValueList: CompareValueVO[] = [];
          if (sourceKey.valueList !== null && sourceKey.valueList.length > 0) {
            sourceKey.valueList.forEach(v => {
              const diffValue = new CompareValueVO();
              diffValue.languageId = v.languageId;
              diffValue.valueId = v.valueId;
              diffValue.value = v.value;
              diffValue.language = v.languageName;
              sourceValueList.push(diffValue);
            });
          }
          sourceCompare.valueList = sourceValueList;

          const targetValueList: CompareValueVO[] = [];
          if (targetKey.valueList !== null && targetKey.valueList.length > 0) {
            targetKey.valueList.forEach(v => {
              const diffValue = new CompareValueVO();
              diffValue.languageId = v.languageId;
              diffValue.valueId = v.valueId;
              diffValue.value = v.value;
              diffValue.language = v.languageName;
              targetValueList.push(diffValue);
            });
          }
          targetCompare.valueList = targetValueList;

          compareBranchVO.source = sourceCompare;
          compareBranchVO.target = targetCompare;
          result.push(compareBranchVO);
        }
      }
    }
    // When crosmerge is true, the branches need to be compared with each other
    if (crosMerge) {
      const crosMergeResult = await this.diffKey(target, source, false);
      if (crosMergeResult !== null && crosMergeResult.length > 0) {
        const mergeResult: CompareBranchVO[] = [];
        crosMergeResult.forEach(r => {
          const result = new CompareBranchVO();
          if (r.target !== null) {
            result.source = r.target;
          }
          result.target = r.source;
          mergeResult.push(result);
        });
        result = result.concat(mergeResult);
      }
    }
    // 去重
    let unique = {};
    result.forEach(item => {
      unique[JSON.stringify(item)] = item;
    });
    result = Object.keys(unique).map(item => JSON.parse(item));
    // 按照 namespace name 排序
    result.sort((a, b) => {
      const snn1 = a.source.namespaceName.toUpperCase();
      const snn2 = b.source.namespaceName.toUpperCase();

      if (snn1 < snn2) {
        return -1;
      }
      if (snn1 > snn2) {
        return 1;
      }
      return 0;
    });
    return result;
  }

  /**
   * return true --> source === target / false --> source !== target
   * @param source
   * @param target
   */
  private checkValueVO(source: ValueVO[], target: ValueVO[]): boolean {
    const sourceEmtpy = (source === null || source.length === 0) && target !== null && target.length > 0;
    const targetEmpty = (target === null || target.length === 0) && source !== null && source.length > 0;
    if (sourceEmtpy || targetEmpty) {
      return false;
    } else {
      if (source.length !== target.length) {
        return false;
      }
      return source.every(i => {
        const filterLanguage = target.filter(j => j.languageId === i.languageId);
        if (filterLanguage.length > 0) {
          const filterValue = filterLanguage.filter(m => m.value !== i.value);
          return !(filterValue.length > 0);
        } else {
          return false;
        }
      });
    }
  }

  /**
   * 找出string不同的地方并高亮显示
   * @param source source
   * @param destination destination
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async getDiff(source: string, destination: string): Promise<string> {
    if (source === destination) {
      return destination;
    }
    if (source === '' && destination !== '') {
      return '';
    }
    // eslint-disable-next-line prettier/prettier
    // eslint-disable-next-line @typescript-eslint/quotes
    const prefix = "<span style='color:blue'>";
    const suffix = '</sapn>';
    if (source === '' && destination !== '') {
      return prefix + destination + suffix;
    }
    let end;
    let append;
    if (source.length >= destination.length) {
      end = destination.length;
      append = true;
    } else {
      end = source.length;
      append = false;
    }
    const result = [];
    const sourceArray = source.split('');
    const destArray = destination.split('');
    let flag = false;
    for (let index = 0; index < end; index++) {
      if (sourceArray[index] !== destArray[index]) {
        if (index === 0) {
          result.push(prefix);
          result.push(destArray[index]);
          flag = true;
          continue;
        }
        if (index > 0 && sourceArray[index - 1] !== destArray[index - 1]) {
          result.push(destArray[index]);
        } else {
          result.push(prefix);
          result.push(destArray[index]);
        }
        flag = true;
      } else {
        if (flag) {
          result.push(suffix);
          result.push(destArray[index]);
          flag = false;
        } else {
          result.push(sourceArray[index]);
        }
      }
      // 此时到末尾
      if (index === end - 1 && flag) {
        if (append) {
          result.push(source.substring(end, source.length));
        } else {
          result.push(destination.substring(end, destination.length));
        }
        result.push(suffix);
      }
    }
    return result.toString().replace(/,/g, '');
  }
  /**
   * 分页返回branchs
   * @param page page
   */
  async findAllWithPage(page: BranchPage): Promise<PageResult> {
    let pageResult = new PageResult();
    const start: number = (page.page - 1) * page.size;
    let data: [Branch[], number] = [[], 0];
    if (page.content === null || page.content === CommonConstant.STRING_BLANK) {
      data = await this.branchRepository.findAndCount({
        where: { projectId: page.projectId },
        order: { name: 'ASC' },
        skip: start,
        take: page.size,
      });
    } else {
      // 查询不区分大小写
      data = await this.branchRepository.findAndCount({
        where: { projectId: page.projectId, name: Like('%' + page.content + '%') },
        order: { name: 'ASC' },
        skip: start,
        take: page.size,
      });
    }
    pageResult.size = page.size;
    pageResult.page = page.page;
    pageResult.total = data[1];
    if (pageResult.total > 0) {
      pageResult.data = await this.calculateMerge(data[0], page.projectId);
    } else {
      pageResult.data = [];
    }
    return pageResult;
  }

  /**
   * 获取branch merge参数状态
   * @param data data
   */
  private async calculateMerge(data: Branch[], projectId: number): Promise<BranchVO[]> {
    // merge table source & target 都不存在
    const mergeResult: BranchMerge[] = await this.branchMergeRepository.find({
      where: { projectId, type: In(['0', '3']) },
    });
    // 获取全部的merge ids
    let ids: Set<number> = new Set();
    mergeResult.forEach(m => {
      ids.add(m.sourceBranchId);
      ids.add(m.targetBranchId);
    });

    // key: merge_id  value: sourceBranchId & targetBranchId包含的最新的数据
    let map: Map<number, BranchMerge> = new Map();

    // 汇总并排序取最新值作为merge标准
    ids.forEach(i => {
      let array: Array<BranchMerge> = [];
      mergeResult.forEach(m => {
        if (i === m.sourceBranchId || i === m.targetBranchId) {
          array.push(m);
        }
      });
      map.set(i, array.sort((a, b) => a.id - b.id).pop());
    });

    let branchVOs: BranchVO[] = [];
    data.forEach(d => {
      let branchVO = new BranchVO();
      branchVO.id = d.id;
      branchVO.name = d.name;
      branchVO.time = d.modifyTime === null || d.modifyTime === undefined ? null : d.modifyTime.valueOf();
      branchVO.isMaster = d.master;
      // 默认是 0 -> open
      branchVO.merge = this.constant.get('0');
      map.forEach((x, y) => {
        if (y === d.id) {
          branchVO.merge =
            x.type === CommonConstant.MERGE_TYPE_MERGED || x.type === CommonConstant.MERGE_TYPE_REFUSED
              ? this.constant.get('0')
              : this.constant.get('1');
        }
      });
      branchVOs.push(branchVO);
    });
    return branchVOs;
  }

  /**
   * 通过项目id查询分支
   * @param projectId
   */
  async findBranchByProjectId(projectId: number): Promise<Branch[]> {
    return await this.branchRepository.find({ projectId });
  }

  /**
   * 通过项目id查询分支
   * @param projectId
   */
  async findBranchByProjectIdAndKeyword(projectId: number, keyword: string): Promise<Branch[]> {
    return await this.branchRepository.find({ where: { name: Like('%' + keyword + '%'), projectId } });
  }

  /**
   * 保存branch,默认创建master
   * @param branchBody branchBody
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async save(branchBody: BranchBody): Promise<void> {
    const modifyTime = new Date();
    // 判断project_id 是否存在
    if ((await this.projectRepository.findOne({ id: branchBody.projectId })) === undefined) {
      throw new BadRequestException(ErrorMessage.PROJECT_NOT_EXIST);
    }
    // 是否从其他branch复制，是否是master分支
    let inheritBranch = false;
    let isMaster = false;
    // check branch exist?
    if (branchBody.branchId !== null && branchBody.branchId !== undefined) {
      const branch = await this.branchRepository.findOne({ id: branchBody.branchId });
      if (branch === undefined) {
        throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
      } else {
        // 从其他分支复制
        inheritBranch = true;
        const masterBranch = await this.findMasterBranchByProjectId(branchBody.projectId);
        if (masterBranch !== undefined) {
          if (masterBranch.id === branchBody.branchId) {
            // 复制的分支是主分支
            isMaster = true;
          }
        }
      }
    }

    // check branch name duplicate
    const dupBranch = await this.branchRepository.find({
      where: { name: branchBody.name.trim(), projectId: branchBody.projectId },
    });
    if (dupBranch !== null && dupBranch.length > 0) {
      throw new BadRequestException(ErrorMessage.BRANCH_NAME_DUPLICATE);
    }
    const branch = await this.branchRepository.save({
      name: branchBody.name.trim(),
      projectId: branchBody.projectId,
      master: false,
      modifier: branchBody.user,
      modifyTime: modifyTime,
    });

    if (inheritBranch && !isMaster) {
      const branchCommit = new BranchCommit();
      const commitId = UUIDUtils.generateUUID();
      branchCommit.branchId = branch.id;
      branchCommit.commitId = commitId;
      branchCommit.type = CommonConstant.COMMIT_TYPE_ADD;
      branchCommit.commitTime = modifyTime;
      await this.branchCommitRepository.save(branchCommit);

      const branchKeyList = await this.branchKeyRepository.find({ where: { branchId: branchBody.branchId } });
      const newBranchKeyList: BranchKey[] = [];
      const keyIdList: number[] = [];
      branchKeyList.forEach(bk => {
        const branchKey = new BranchKey();
        branchKey.keyId = bk.keyId;
        branchKey.branchId = branch.id;
        branchKey.delete = false;
        newBranchKeyList.push(branchKey);
        keyIdList.push(bk.keyId);
      });
      // add branch_key
      await this.branchKeyRepository.save(newBranchKeyList);

      if (keyIdList.length > 0) {
        for (let i = 0; i < keyIdList.length; i++) {
          const keyId = keyIdList[i];
          const key = await this.keyRepository.findOne(keyId);
          if (key !== undefined) {
            let newKey = new Key();
            newKey.actualId = key.actualId;
            newKey.namespaceId = key.namespaceId;
            newKey.delete = false;
            newKey.modifier = branchBody.user;
            newKey.modifyTime = modifyTime;
            newKey = await this.keyRepository.save(newKey);
            // 需要更新 branch key的key id为新的 key id
            // eslint-disable-next-line max-len
            const updateBranchKeySql = `update branch_key set key_id = ${newKey.id} where key_id=${key.id} and delete = false and branch_id=${branch.id}`;
            await this.branchKeyRepository.query(updateBranchKeySql);
            const keyNameList = await this.keynameRepository.query(
              `select * from keyname where key_id=${key.id} and latest = true`,
            );
            if (keyNameList !== null && keyNameList.length > 0) {
              const keyname = keyNameList[0];
              if (keyname !== undefined) {
                let newKeyname = new Keyname();
                newKeyname.keyId = newKey.id;
                newKeyname.name = keyname.name;
                newKeyname.commitId = commitId;
                newKeyname.latest = true;
                newKeyname.modifier = branchBody.user;
                newKeyname.modifyTime = modifyTime;
                await this.keynameRepository.save(newKeyname);
              }
            }

            const keyvalueList = await this.keyvalueRepository.find({ where: { keyId: key.id, latest: true } });
            if (keyvalueList !== null && keyvalueList.length > 0) {
              const newKeyvalueList: Keyvalue[] = [];
              keyvalueList.forEach(kv => {
                const newKv = new Keyvalue();
                newKv.keyId = newKey.id;
                newKv.languageId = kv.languageId;
                newKv.value = kv.value;
                newKv.latest = true;
                newKv.commitId = commitId;
                newKv.modifier = branchBody.user;
                newKv.midifyTime = modifyTime;
                newKeyvalueList.push(newKv);
              });
              await this.keyvalueRepository.save(newKeyvalueList);
            }
          }
        }
      }
    }
  }

  /**
   * 根据id删除branch
   * @param id id
   */
  async deleteBranch(id: number): Promise<void> {
    const branches: Branch[] = await this.branchRepository.query(
      `SELECT * FROM branch WHERE branch.master = true AND branch.id = ${id}`,
    );
    if (branches.length !== 0) {
      throw new BadRequestException('can not delete master branch');
    }
    const existBranchMerge = await this.branchMergeRepository.find({
      where: [
        {
          sourceBranchId: id,
          type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]),
        },
        {
          targetBranchId: id,
          type: In([CommonConstant.MERGE_TYPE_CREATED, CommonConstant.MERGE_TYPE_MERGING]),
        },
      ],
    });
    if (existBranchMerge !== null && existBranchMerge.length > 0) {
      throw new BadRequestException(ErrorMessage.BRANCH_IS_MERGING);
    }
    const result: DeleteResult = await this.branchRepository.delete({ id: id });
    if (result.affected.toString() !== '1') {
      throw new BadRequestException('delete branch error');
    }
  }

  // branch_id -> key_Ids
  async findKeyIdsByBranchIds(id: number): Promise<any[]> {
    return await this.branchRepository.query(
      'SELECT key.id as key_id FROM (SELECT * FROM branch LEFT JOIN branch_key ON ' +
        'branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE AND branch.master = TRUE ' +
        `AND branch.id = '${id}') a ` +
        'LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE AND key.id = key.actual_id',
    );
  }

  // key_ids -> key-value
  async findKeysByKeyIds(ids: string): Promise<any[]> {
    return await this.branchRepository.query(
      'SELECT k.key_id as id, k.name, a.value, a.language_name FROM keyname k inner join ' +
        '(SELECT keyvalue.id, keyvalue.key_id, keyvalue.value, language.name as language_name, ' +
        'keyvalue.latest from keyvalue LEFT JOIN language on keyvalue.language_id = language.id) ' +
        'a on k.key_id = a.key_id WHERE a.latest = true AND k.key_id in ' +
        ids,
    );
  }
  // branch branch_key key
  async findKeyWithBranch(): Promise<any[]> {
    return await this.branchRepository.query(
      'SELECT a.project_id, a.branch_id as branchId, a.name as branch_name, a.master as is_master, key.id as key_id, ' +
        'key.actual_id, key.namespace_id FROM (SELECT * FROM branch LEFT JOIN branch_key ON ' +
        'branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE AND branch.master = TRUE) a ' +
        'LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE',
    );
  }

  /**
   * 通过项目id查询master分支
   * @param projectId projectId
   */
  async findMasterBranchByProjectId(projectId: number): Promise<Branch> | undefined {
    const branchList = await this.branchRepository.find({ projectId, master: true });
    if (branchList === null) {
      return undefined;
    } else {
      return branchList[0];
    }
  }

  /**
   * 通过分支ID获取分支信息
   */
  async getBranchById(id: number): Promise<Branch> | undefined {
    return await this.branchRepository.findOne({ id: id });
  }

  async findMasterBranchByBranchId(branchId: number): Promise<Branch> | undefined {
    // eslint-disable-next-line max-len
    const query = `select * from branch WHERE project_id = (select project_id from branch where id=${branchId}) and master = true`;
    const branchList = await this.branchRepository.query(query);
    if (branchList === null) {
      return undefined;
    } else {
      return branchList[0];
    }
  }
}
