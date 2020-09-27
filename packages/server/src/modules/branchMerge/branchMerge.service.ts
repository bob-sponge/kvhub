/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchCommit } from 'src/entities/BranchCommit';
import { MergeDiffKey } from 'src/entities/MergeDiffKey';
import { MergeDiffValue } from 'src/entities/MergeDiffValue';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeVO } from 'src/vo/BranchMergeVO';
import { BranchMergeDiffVO } from 'src/vo/BranchMergeDiffVO';
import { MergeDiffShowVO } from 'src/vo/MergeDiffShowVO';
import { MergeDiffValueShowVO } from 'src/vo/MergeDiffValueShowVo';
import { BranchMergeSubmitVO } from 'src/vo/BranchMergeSubmitVO';
import { BranchService } from 'src/modules/branch/branch.service';
import { KeyService } from 'src/modules/key/key.service';
import { CommonConstant, ErrorMessage } from 'src/constant/constant';
import { UUIDUtils } from 'src/utils/uuid';
import { ValueVO } from 'src/vo/ValueVO';
import { KeyValueDetailVO } from 'src/vo/KeyValueDetailVO';
import { SelectedKeyDTO, SelectedValueDTO } from './dto/SelectMergeDTO';
import { Key } from 'src/entities/Key';
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';
import { BranchKey } from 'src/entities/BranchKey';
import { Namespace } from 'src/entities/Namespace';
import { Project } from 'src/entities/Project';
import { Language } from 'src/entities/Language';
import * as Log4js from 'log4js';

@Injectable()
export class BranchMergeService {
  constructor(
    @InjectRepository(BranchMerge)
    private readonly branchMergeRepository: Repository<BranchMerge>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(MergeDiffKey)
    private readonly mergeDiffKeyRepository: Repository<MergeDiffKey>,
    @InjectRepository(MergeDiffValue)
    private readonly mergeDiffValueRepository: Repository<MergeDiffValue>,
    @InjectRepository(BranchCommit)
    private readonly branchCommitRepository: Repository<BranchCommit>,
    @InjectRepository(BranchKey)
    private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
    @InjectRepository(Keyname)
    private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Keyvalue)
    private readonly keyvalueRepository: Repository<Keyvalue>,
    @InjectRepository(Namespace)
    private readonly namespaceRepository: Repository<Namespace>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly branchService: BranchService,
    private readonly keyService: KeyService,
  ) {}

  async getInfoById(id: number): Promise<BranchMergeVO> {
    const branchMergeVO = new BranchMergeVO();
    const branchMerge = await this.branchMergeRepository.findOne(id);
    if (branchMerge === null) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_NOT_EXIST);
    }
    branchMergeVO.id = branchMerge.id;
    branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
    branchMergeVO.targetBranchId = branchMerge.targetBranchId;
    branchMergeVO.type = branchMerge.type;
    branchMergeVO.crosMerge = branchMerge.crosMerge;
    branchMergeVO.commitId = branchMerge.commitId;

    const branchList = await this.branchRepository.find({
      where: [{ id: branchMerge.sourceBranchId }, { id: branchMerge.targetBranchId }],
    });
    branchList.forEach(branch => {
      if (branch.id === branchMergeVO.sourceBranchId) {
        branchMergeVO.sourceBranchName = branch.name;
        branchMergeVO.projectId = branch.projectId;
      }
      if (branch.id === branchMergeVO.targetBranchId) {
        branchMergeVO.targetBranchName = branch.name;
        branchMergeVO.projectId = branch.projectId;
      }
    });
    return branchMergeVO;
  }

  async refuse(id: number) {
    const branchMerge = await this.branchMergeRepository.findOne(id);
    if (branchMerge === undefined) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_NOT_EXIST);
    }
    branchMerge.type = CommonConstant.MERGE_TYPE_REFUSED;
    branchMerge.modifyTime = new Date();
    this.branchMergeRepository.save(branchMerge);
  }

  async list(vo: BranchMergeSearchVO): Promise<BranchMergeVO[]> {
    let result: BranchMergeVO[] = [];
    // 根据传入的projectid和关键字，查找分支
    let branchList: Branch[] = await this.branchService.findBranchByProjectIdAndKeyword(vo.projectId, vo.keywrod);
    const branchAllList: Branch[] = await this.branchService.findBranchByProjectId(vo.projectId);

    // 得到分支集合后，获取分支的id并进行拼接
    const branchIdList: number[] = [];
    branchList.forEach(branch => {
      branchIdList.push(branch.id);
    });

    if (branchIdList.length > 0) {
      // 拼接分支id后，通过sql查找到项目的分支merge记录，source 和 target 都需要进行查找
      const branchMergeList: BranchMerge[] = await this.branchMergeRepository.find({
        where: [{ sourceBranchId: In(branchIdList) }, { targetBranchId: In(branchIdList) }],
        order: { id: 'DESC' },
      });

      // 得到记录后，按照source和target分支id获取对应的分支名称
      for (let i = 0; i < branchMergeList.length; i++) {
        let branchMergeVO = new BranchMergeVO();
        const branchMerge = branchMergeList[i];

        branchMergeVO.id = branchMerge.id;
        branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
        branchMergeVO.targetBranchId = branchMerge.targetBranchId;
        branchMergeVO.type = branchMerge.type;
        branchMergeVO.crosMerge = branchMerge.crosMerge;
        branchMergeVO.commitId = branchMerge.commitId;
        branchMergeVO.modifier = branchMerge.modifier;
        branchMergeVO.modifyTime = branchMerge.modifyTime;

        for (let j = 0; j < branchAllList.length; j++) {
          const branch = branchAllList[j];
          if (branch.id === branchMergeVO.sourceBranchId) {
            branchMergeVO.sourceBranchName = branch.name;
          }
          if (branch.id === branchMergeVO.targetBranchId) {
            branchMergeVO.targetBranchName = branch.name;
          }
          if (branchMergeVO.sourceBranchName && branchMergeVO.targetBranchName) {
            break;
          }
        }
        result.push(branchMergeVO);
      }
    }
    return result;
  }

  /**
   * get diff key and value through merge branch id
   * @param mergeId merge branch id
   */
  async getDiffById(mergeId: number): Promise<BranchMergeDiffVO[]> {
    const result: BranchMergeDiffVO[] = [];
    const branchMerge = await this.branchMergeRepository.findOne(mergeId);
    if (branchMerge === undefined) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_NOT_EXIST);
    }
    const sourceBranchId = branchMerge.sourceBranchId;
    const targetBranchId = branchMerge.targetBranchId;

    const mergeBranchKeyList = await this.mergeDiffKeyRepository.find({ mergeId });
    if (mergeBranchKeyList === null || mergeBranchKeyList.length === 0) {
      return result;
    }
    for (let i = 0; i < mergeBranchKeyList.length; i++) {
      let vo = new BranchMergeDiffVO();
      vo.mergeDiffKey = mergeBranchKeyList[i];
      vo.keyActualId = vo.mergeDiffKey.key;
      vo.source = await this.getMergeDiffInfo(vo.mergeDiffKey.id, sourceBranchId, vo.mergeDiffKey.key);
      vo.target = await this.getMergeDiffInfo(vo.mergeDiffKey.id, targetBranchId, vo.mergeDiffKey.key);
      result.push(vo);
    }
    result.sort((a, b) => {
      let sortNameA = CommonConstant.STRING_BLANK;
      let sortNameB = CommonConstant.STRING_BLANK;
      let sourceAExist = false;
      let sourceBExist = false;
      if (a.source !== null && a.source !== undefined && a.source.namespaceName !== undefined) {
        sourceAExist = true;
        sortNameA = a.source.namespaceName;
      }
      if (b.source !== null && b.source !== undefined && b.source.namespaceName !== undefined) {
        sourceBExist = true;
        sortNameB = b.source.namespaceName;
      }
      if (sortNameA !== sortNameB) {
        if (sourceAExist) {
          sortNameA = a.source.keyname;
        }
        if (sourceBExist) {
          sortNameB = b.source.keyname;
        }
        return sortNameA.localeCompare(sortNameB);
      } else {
        return sortNameA.localeCompare(sortNameB);
      }
    });
    return result;
  }
  private async getMergeDiffInfo(
    mergeDiffKeyId: number,
    branchId: number,
    keyActualId: number,
  ): Promise<MergeDiffShowVO> {
    const languages: Language[] = await this.getAllLanguage();
    const languageMap = new Map();
    languages.forEach(item => {
      languageMap.set(item.id, item.name);
    });
    let vo = new MergeDiffShowVO();
    let valueList: MergeDiffValueShowVO[] = [];
    let key = await this.keyService.getKeyByBranchIdAndKeyActualId(branchId, keyActualId);
    if (key === undefined) {
      return vo;
    } else {
      vo.keyId = key.id;
      vo.branchId = branchId;
      vo.namespaceId = key.namespaceId;
      const namespace = await this.namespaceRepository.findOne(vo.namespaceId);
      if (namespace !== undefined && !namespace.delete) {
        vo.namespaceName = namespace.name;
      }
    }

    // key -> keyname
    const keyName = await this.keyService.getKeyInfo(key.id, false);
    vo.keyname = keyName.name;
    vo.keyNameId = keyName.keynameId;

    // 获取value
    const mergeDiffValueList = await this.mergeDiffValueRepository.find({ mergeDiffKeyId, branchId });
    for (let i = 0; i < mergeDiffValueList.length; i++) {
      let valueShowVO = new MergeDiffValueShowVO();
      const mergeDiffValue = mergeDiffValueList[i];
      valueShowVO.valueId = mergeDiffValue.valueId;
      const value = await this.keyvalueRepository.findOne(mergeDiffValue.valueId);
      valueShowVO.languageId = mergeDiffValue.languageId;
      valueShowVO.language = languageMap.get(mergeDiffValue.languageId);
      valueShowVO.value = value.value;
      valueList.push(valueShowVO);
    }
    valueList.sort((v1, v2) => v1.languageId - v2.languageId);
    vo.valueList = valueList;
    return vo;
  }

  /**
   * save branch merge data
   * @param vo  \{\"sourceBranchId\":3,\"targetBranchId\":4,\"crosMerge\":true\}
   * @returns branch merge id
   */
  async save(vo: BranchMerge): Promise<number> {
    const project = await this.projectRepository.findOne(vo.projectId);
    if (project === undefined || project.delete) {
      throw new BadRequestException(ErrorMessage.PROJECT_NOT_EXIST);
    }

    // check branch id
    await this.checkBranch(vo.sourceBranchId);
    await this.checkBranch(vo.targetBranchId);

    if (vo.targetBranchId === vo.sourceBranchId) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_SAME);
    }

    vo.commitId = UUIDUtils.generateUUID();
    vo.type = CommonConstant.MERGE_TYPE_CREATED;
    vo.modifyTime = new Date();
    const branchMerge = await this.branchMergeRepository.save(vo);
    return branchMerge.id;
  }

  private async checkBranch(id: number) {
    if (id !== null && id !== undefined) {
      const branch = await this.branchService.getBranchById(id);
      if (branch === undefined) {
        throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
      } else {
        await this.checkExistBranchMerge(id);
      }
    } else {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_CHOOSE);
    }
  }

  async checkExistBranchMerge(branchId: number) {
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
  }

  /**
   * Obtain branch data through mergeId, and then generate diff data
   * @param mergeId
   * @throws BadRequestException
   */
  async generateDiffKey(mergeId: number) {
    // check branchmerge is exist and type is created
    const branchMerge = await this.branchMergeRepository.findOne(mergeId);
    if (branchMerge === undefined) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_NOT_EXIST);
    } else if (branchMerge.type !== CommonConstant.MERGE_TYPE_CREATED) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_IS_NOT_CREATED);
    }

    // get source and target branch id
    const sourceBranchId = branchMerge.sourceBranchId;
    const targetBranchId = branchMerge.targetBranchId;

    // By branch id, get the key corresponding to the branch and the name and value corresponding to the key
    let sourceKeyList = await this.keyService.getKeyListByBranchId(sourceBranchId);
    let targetKeyList = await this.keyService.getKeyListByBranchId(targetBranchId);

    await this.diffKey(sourceKeyList, targetKeyList, mergeId, branchMerge.crosMerge, sourceBranchId, targetBranchId);
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
    mergeId: number,
    crosmerge: boolean,
    sourceBranchId: number,
    targetBranchId: number,
  ) {
    for (const item of source) {
      let targetKey = new KeyValueDetailVO();
      let diffValueList: MergeDiffValue[] = [];
      const sourceKey = item;
      // 如果在目标分支找不到 和源分支keyname 一样的，则表明diff 值只存在原始分支
      const existedTargetKey = target.find(m => m.keyName === item.keyName && m.namespaceId === item.namespaceId);
      if (existedTargetKey === undefined) {
        // 表明不存在，只返回源
        let mergeDiffKey = new MergeDiffKey();
        mergeDiffKey.mergeId = mergeId;
        mergeDiffKey.key = sourceKey.keyActualId;
        mergeDiffKey = await this.mergeDiffKeyRepository.save(mergeDiffKey);
        if (sourceKey.valueList !== null && sourceKey.valueList.length > 0) {
          sourceKey.valueList.forEach(v => {
            let diffValue = new MergeDiffValue();
            diffValue.languageId = v.languageId;
            diffValue.mergeDiffKeyId = mergeDiffKey.id;
            diffValue.valueId = v.valueId;
            diffValue.keyId = sourceKey.keyId;
            diffValue.branchId = sourceBranchId;
            diffValueList.push(diffValue);
          });
        }
      } else {
        // 表明存在
        targetKey = existedTargetKey;
        const valueCheck = this.checkValueVO(sourceKey.valueList, targetKey.valueList);
        if (!valueCheck) {
          let mergeDiffKey = new MergeDiffKey();
          mergeDiffKey.mergeId = mergeId;
          mergeDiffKey.key = sourceKey.keyActualId;
          mergeDiffKey = await this.mergeDiffKeyRepository.save(mergeDiffKey);

          if (sourceKey.valueList !== null && sourceKey.valueList.length > 0) {
            sourceKey.valueList.forEach(v => {
              let diffValue = new MergeDiffValue();
              diffValue.languageId = v.languageId;
              diffValue.mergeDiffKeyId = mergeDiffKey.id;
              diffValue.valueId = v.valueId;
              diffValue.keyId = sourceKey.keyId;
              diffValue.branchId = sourceBranchId;
              diffValueList.push(diffValue);
            });
          }
          if (targetKey.valueList !== null && targetKey.valueList.length > 0) {
            targetKey.valueList.forEach(v => {
              let diffValue = new MergeDiffValue();
              diffValue.languageId = v.languageId;
              diffValue.mergeDiffKeyId = mergeDiffKey.id;
              diffValue.valueId = v.valueId;
              diffValue.keyId = targetKey.keyId;
              diffValue.branchId = targetBranchId;
              diffValueList.push(diffValue);
            });
          }
        }
      }
      if (diffValueList.length > 0) {
        await this.mergeDiffValueRepository.save(diffValueList);
      }
    }

    // When crosmerge is true, the branches need to be compared with each other
    if (crosmerge != null && crosmerge) {
      await this.diffKey(target, source, mergeId, false, targetBranchId, sourceBranchId);
    }
  }

  /**
   * return true --> source === target / false source !== target
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
          const filterValue = target.filter(j => j.languageId === i.languageId).filter(m => m.value !== i.value);
          return !(filterValue.length > 0);
        } else {
          return false;
        }
      });
    }
  }

  /**
   * merge
   * @param vo
   */
  async merge(vo: BranchMergeSubmitVO, user: string) {
    const logger = Log4js.getLogger();
    logger.level = 'INFO';
    // check merge branch is exist or is created status!
    const mergeId = vo.mergeId;
    let branchMerge = await this.branchMergeRepository.findOne(mergeId);
    if (null === branchMerge || undefined === branchMerge) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_NOT_EXIST);
    } else if (
      CommonConstant.MERGE_TYPE_REFUSED === branchMerge.type ||
      CommonConstant.MERGE_TYPE_MERGED === branchMerge.type ||
      CommonConstant.MERGE_TYPE_MERGING === branchMerge.type
    ) {
      throw new BadRequestException(ErrorMessage.BRANCH_MERGE_IS_NOT_CREATED);
    }

    // check all the merge diff key are selected!
    const mergeDiffList = await this.getDiffById(vo.mergeId);
    if (null === mergeDiffList || mergeDiffList.length === 0) {
      return;
    }

    branchMerge.type = CommonConstant.MERGE_TYPE_MERGING;
    await this.branchMergeRepository.save(branchMerge);

    try {
      const paramMergeList = vo.branchMergeDiffList;
      if (null === paramMergeList || paramMergeList.length === 0) {
        throw new BadRequestException(ErrorMessage.BRANCH_MERGE_DIFF_KEY_NOT_CHOOSE);
      } else if (paramMergeList.length < mergeDiffList.length) {
        throw new BadRequestException(ErrorMessage.BRANCH_MERGE_DIFF_KEY_NOT_SELECT_ALL);
      }

      /**
       * According to the incoming key and value, compare with the key and value found in the system,
       * the selected and modified ones will be submitted
       */

      for (let i = 0; i < paramMergeList.length; i++) {
        const paramMergeDiff = paramMergeList[i];
        if (paramMergeDiff.mergeDiffKey.selectBranchId !== null && paramMergeDiff.mergeDiffKey.selectBranchId > 0) {
          await this.mergeKey(paramMergeDiff, branchMerge, user);
        } else {
          throw new BadRequestException(ErrorMessage.BRANCH_MERGE_DIFF_KEY_NOT_SELECT_ALL);
        }
      }

      branchMerge.type = CommonConstant.MERGE_TYPE_MERGED;
      await this.branchMergeRepository.save(branchMerge);
    } catch (error) {
      logger.info(`merge fail. details: ${error}`);
      branchMerge.type = CommonConstant.MERGE_TYPE_FAILED;
      await this.branchMergeRepository.save(branchMerge);
    }
  }

  /**
   *
   * @param diffVO
   * @param crosMerge
   */
  private async mergeKey(diffVO: BranchMergeDiffVO, branchMerge: BranchMerge, user: string) {
    const time = new Date();
    const source = diffVO.source;
    const target = diffVO.target;
    const masterBranch = await this.branchService.findMasterBranchByBranchId(source.branchId);
    let masterBranchId = 0;
    if (masterBranch === null) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    } else {
      masterBranchId = masterBranch.id;
    }

    let selectedKey = new SelectedKeyDTO();
    const selectBranchId = diffVO.mergeDiffKey.selectBranchId;
    const notSelectBranchId = selectBranchId === source.branchId ? target.branchId : source.branchId;
    let selectSource: boolean;
    selectSource = selectBranchId === source.branchId ? true : false;

    if (selectBranchId === source.branchId) {
      selectedKey = await this.getSelectedMergeInfo(source);
    } else {
      selectedKey = await this.getSelectedMergeInfo(target);
    }

    // save branch commit data
    let branchCommit = new BranchCommit();
    branchCommit.branchId = branchMerge.targetBranchId;
    branchCommit.commitId = branchMerge.commitId;
    branchCommit.commitTime = time;
    branchCommit.type = CommonConstant.COMMIT_TYPE_MERGE;
    await this.branchCommitRepository.save(branchCommit);

    if (branchMerge.crosMerge !== null && branchMerge.crosMerge) {
      branchCommit.branchId = branchMerge.sourceBranchId;
      branchCommit.commitId = branchMerge.commitId;
      branchCommit.commitTime = time;
      branchCommit.type = CommonConstant.COMMIT_TYPE_MERGE;
      await this.branchCommitRepository.save(branchCommit);
    }

    // 如果选中的是 master 分支
    // 删除 另一个分支原有的内容
    if (selectBranchId === masterBranchId) {
      if (selectBranchId === source.branchId) {
        const notSelectKeyId = target.keyId;
        const branchKeys = await this.branchKeyRepository.find({
          where: { branchId: notSelectBranchId, keyId: notSelectKeyId },
        });
        if (branchKeys !== null && branchKeys.length > 0) {
          const bk = branchKeys[0];
          bk.delete = true;
          await this.branchKeyRepository.save(bk);
        }
      } else if (selectBranchId === target.branchId) {
        const notSelectKeyId = source.keyId;
        const branchKeys = await this.branchKeyRepository.find({
          where: { branchId: notSelectBranchId, keyId: notSelectKeyId },
        });
        if (branchKeys !== null && branchKeys.length > 0) {
          const bk = branchKeys[0];
          bk.delete = true;
          await this.branchKeyRepository.save(bk);
        }
      } else {
        // 传入的分支不对
        throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
      }
    } else if (
      selectBranchId !== masterBranchId &&
      (notSelectBranchId === masterBranchId || notSelectBranchId === null || notSelectBranchId === undefined)
    ) {
      // 选中的分支不是 master 分支，另外一个分支是 master 分支
      // master 分支的 key不变，key name, key value 新增加，并绑定原有key
      // 另一个分支的 branch key 删除
      // 找出master 分支的 key name, 标记删除
      if (target === null || target === undefined || Object.keys(target).length === 0) {
        // 目标分支(master)的为空,不存在比较的key,直接写到master分支
        // 插入key 表, 获取 key id.
        const keyEntity = new Key();
        keyEntity.modifier = user;
        keyEntity.namespaceId = source.namespaceId;
        keyEntity.modifyTime = time;
        keyEntity.delete = false;
        keyEntity.actualId = 0;
        const insertKey = await this.keyRepository.insert(keyEntity);
        const keyEntityId = insertKey.raw[0].id;
        this.keyRepository.query(`update key set actual_id=${keyEntityId} where id=${keyEntityId}`);
        // 插入 key branch 表
        const branchKeyEntity = new BranchKey();
        branchKeyEntity.branchId = branchMerge.targetBranchId;
        branchKeyEntity.keyId = keyEntityId;
        branchKeyEntity.delete = false;
        await this.branchKeyRepository.insert(branchKeyEntity);
        // 插入keyName 表,
        const keyNameEntity = new Keyname();
        keyNameEntity.keyId = keyEntityId;
        keyNameEntity.modifier = user;
        keyNameEntity.modifyTime = time;
        keyNameEntity.name = source.keyname;
        keyNameEntity.commitId = branchMerge.commitId;
        // throw new Error('test transaction.');
        await this.keynameRepository.insert(keyNameEntity);
        let keyValueEntitys = [];
        source.valueList.forEach(d => {
          const languageId = d.languageId;
          const value = d.value;
          const keyValueEntity = new Keyvalue();
          if (value === null || value === '' || value === undefined) {
            keyValueEntity.value = ' ';
          } else {
            keyValueEntity.value = value;
            keyValueEntity.keyId = keyEntityId;
            keyValueEntity.commitId = branchMerge.commitId;
            keyValueEntity.languageId = languageId;
            keyValueEntity.latest = true;
            keyValueEntity.modifier = user;
            keyValueEntity.midifyTime = time;
            keyValueEntitys.push(keyValueEntity);
          }
        });
        await this.keyvalueRepository.insert(keyValueEntitys);
      } else {
        let masterKeyName = null;
        let noMasterKeyName = null;
        if (selectSource) {
          masterKeyName = await this.keynameRepository.findOne(target.keyNameId);
          noMasterKeyName = await this.keynameRepository.findOne(source.keyNameId);
        } else {
          masterKeyName = await this.keynameRepository.findOne(source.keyNameId);
          noMasterKeyName = await this.keynameRepository.findOne(target.keyNameId);
        }
        masterKeyName.modifyTime = time;
        masterKeyName.latest = false;
        await this.keynameRepository.save(masterKeyName);
        // 把另一个分支的name 复制过来
        const newKeyname = masterKeyName;
        newKeyname.commitId = branchMerge.commitId;
        newKeyname.name = selectedKey.keyName;
        newKeyname.latest = true;
        await this.keynameRepository.save(newKeyname);

        //  处理值
        // 标记原来 master的值删除
        let masterValues = [];
        if (selectSource) {
          const ids = target.valueList.map(item => item.valueId);
          masterValues = await this.keyvalueRepository.findByIds(ids);
        } else {
          const ids = source.valueList.map(item => item.valueId);
          masterValues = await this.keyvalueRepository.findByIds(ids);
        }
        masterValues.forEach(item => {
          item.latest = false;
          item.modifyTime = time;
        });
        await this.keyvalueRepository.save(masterValues);

        // 把选中的值，赋予对应的语言的值
        let valueList: Keyvalue[] = [];
        selectedKey.valueList.forEach(item => {
          if (masterValues.filter(m => m.languageId === item.languageId)) {
            masterValues
              .filter(m => m.languageId === item.languageId)
              .map(n => {
                const newValue = new Keyvalue();
                newValue.keyId = n.keyId;
                newValue.languageId = n.languageId;
                newValue.value = item.value;
                newValue.latest = true;
                newValue.mergeId = branchMerge.id;
                newValue.commitId = branchMerge.commitId;
                valueList.push(newValue);
              });
          } else {
            const newValue = new Keyvalue();
            newValue.keyId = masterValues[0].keyId;
            newValue.languageId = item.languageId;
            newValue.value = item.value;
            newValue.latest = true;
            newValue.mergeId = branchMerge.id;
            newValue.commitId = branchMerge.commitId;
            valueList.push(newValue);
          }
        });
        await this.keyvalueRepository.save(valueList);
        // 删除 另一个分支的 branch key
        const branchKeys = await this.branchKeyRepository.find({
          where: { branchId: selectBranchId, keyId: noMasterKeyName.keyId },
        });
        if (branchKeys !== null && branchKeys.length > 0) {
          const bk = branchKeys[0];
          bk.delete = true;
          await this.branchKeyRepository.save(bk);
        }
      }
    } else {
      // 处理 key name
      let selectKeyName = null;
      let notSelectKeyName = null;
      if (selectSource) {
        selectKeyName = await this.keynameRepository.findOne(source.keyNameId);
        notSelectKeyName = await this.keynameRepository.findOne(target.keyNameId);
      } else {
        selectKeyName = await this.keynameRepository.findOne(target.keyNameId);
        notSelectKeyName = await this.keynameRepository.findOne(source.keyNameId);
      }
      notSelectKeyName.modifyTime = time;
      notSelectKeyName.latest = false;
      await this.keynameRepository.save(notSelectKeyName);
      // 把另一个分支的name 复制过来
      const newKeyname = notSelectKeyName;
      newKeyname.commitId = branchMerge.commitId;
      newKeyname.name = selectKeyName.name;
      newKeyname.latest = true;
      await this.keynameRepository.save(newKeyname);

      // 处理key value
      let notSelectValues = [];
      if (selectSource) {
        const ids = target.valueList.map(item => item.valueId);
        notSelectValues = await this.keyvalueRepository.findByIds(ids);
      } else {
        const ids = source.valueList.map(item => item.valueId);
        notSelectValues = await this.keyvalueRepository.findByIds(ids);
      }
      notSelectValues.forEach(item => {
        item.latest = false;
        item.modifyTime = time;
      });
      await this.keyvalueRepository.save(notSelectValues);

      // 把选中的值，赋予对应的语言的值
      let valueList: Keyvalue[] = [];
      selectedKey.valueList.forEach(item => {
        if (notSelectValues.filter(m => m.languageId === item.languageId)) {
          notSelectValues
            .filter(m => m.languageId === item.languageId)
            .map(n => {
              const newValue = new Keyvalue();
              newValue.keyId = n.keyId;
              newValue.languageId = n.languageId;
              newValue.value = item.value;
              newValue.latest = true;
              newValue.mergeId = branchMerge.id;
              newValue.commitId = branchMerge.commitId;
              valueList.push(newValue);
            });
        } else {
          const newValue = new Keyvalue();
          newValue.keyId = notSelectValues[0].keyId;
          newValue.languageId = item.languageId;
          newValue.value = item.value;
          newValue.latest = true;
          newValue.mergeId = branchMerge.id;
          newValue.commitId = branchMerge.commitId;
          valueList.push(newValue);
        }
      });
      await this.keyvalueRepository.save(valueList);
    }
  }

  /**
   * According to MergeDiffShowVO, the values corresponding to the selected key and value are obtained
   * @param dto The key and value data selected for the page
   * @returns SelectedKeyDTO
   */
  private async getSelectedMergeInfo(dto: MergeDiffShowVO): Promise<SelectedKeyDTO> {
    let result = new SelectedKeyDTO();
    result.keyId = dto.keyId;
    result.keyName = dto.keyname;
    result.keyNameId = dto.keyNameId;

    let valueList: SelectedValueDTO[] = [];
    dto.valueList.forEach(v => {
      let value = new SelectedValueDTO();
      value.valueId = v.valueId;
      value.value = v.value;
      value.languageId = v.languageId;
      valueList.push(value);
    });
    result.valueList = valueList;
    return result;
  }

  async getAllLanguage(): Promise<Language[]> {
    const query = 'select * from language';
    const result: Language[] = await this.namespaceRepository.query(query);
    return result;
  }
}
