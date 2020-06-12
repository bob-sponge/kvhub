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
import { Keyname } from 'src/entities/Keyname';
import { Keyvalue } from 'src/entities/Keyvalue';

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
    @InjectRepository(Keyname)
    private readonly keynameRepository: Repository<Keyname>,
    @InjectRepository(Keyvalue)
    private readonly keyvalueRepository: Repository<Keyvalue>,
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
      }
      if (branch.id === branchMergeVO.targetBranchId) {
        branchMergeVO.targetBranchName = branch.name;
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

    // 拼接分支id后，通过sql查找到项目的分支merge记录，source 和 target 都需要进行查找
    let branchMergeList: BranchMerge[] = await this.branchMergeRepository.find({
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
    return result;
  }
  private async getMergeDiffInfo(
    mergeDiffKeyId: number,
    branchId: number,
    keyActualId: number,
  ): Promise<MergeDiffShowVO> {
    let vo = new MergeDiffShowVO();
    let valueList: MergeDiffValueShowVO[] = [];
    let key = await this.keyService.getKeyByBranchIdAndKeyActualId(branchId, keyActualId);
    if (key === undefined) {
      return vo;
    } else {
      vo.keyId = key.id;
      vo.branchId = branchId;
    }

    // key -> keyname
    const keyName = await this.keyService.getKeyInfo(key.id, false);
    vo.keyName = keyName.name;
    vo.keyNameId = keyName.id;

    // 获取value
    const mergeDiffValueList = await this.mergeDiffValueRepository.find({ mergeDiffKeyId });
    for (let i = 0; i < mergeDiffValueList.length; i++) {
      let valueShowVO = new MergeDiffValueShowVO();
      const mergeDiffValue = mergeDiffValueList[i];
      valueShowVO.id = mergeDiffValue.valueId;
      valueShowVO.keyId = key.id;

      const value = await this.keyService.getValueInfo(valueShowVO.id);
      if (value !== undefined) {
        valueShowVO.languageId = value.languageId;
        valueShowVO.languageName = value.langeuage;
        valueShowVO.value = value.value;
        valueList.push(valueShowVO);
      }
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
    if (vo.sourceBranchId !== null && vo.sourceBranchId !== undefined) {
      const branch = await this.branchService.getBranchById(vo.sourceBranchId);
      if (branch === undefined) {
        throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
      } else {
        const existBranchMerge = await this.branchMergeRepository.find({
          where: [
            { sourceBranchId: vo.sourceBranchId, type: CommonConstant.MERGE_TYPE_CREATED },
            { targetBranchId: vo.sourceBranchId, type: CommonConstant.MERGE_TYPE_CREATED },
          ],
        });
        if (existBranchMerge !== null && existBranchMerge.length > 0) {
          throw new BadRequestException(ErrorMessage.BRANCH_IS_MERGING);
        }
      }
    } else {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_CHOOSE);
    }

    if (vo.targetBranchId !== null && vo.targetBranchId !== undefined) {
      const branch = await this.branchService.getBranchById(vo.targetBranchId);
      if (branch === undefined) {
        throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
      } else {
        const existBranchMerge = await this.branchMergeRepository.find({
          where: [
            { sourceBranchId: vo.targetBranchId, type: CommonConstant.MERGE_TYPE_CREATED },
            { targetBranchId: vo.targetBranchId, type: CommonConstant.MERGE_TYPE_CREATED },
          ],
        });
        if (existBranchMerge !== null && existBranchMerge.length > 0) {
          throw new BadRequestException(ErrorMessage.BRANCH_IS_MERGING);
        }
      }
    } else {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_CHOOSE);
    }

    if (vo.targetBranchId === vo.sourceBranchId) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_SAME);
    }

    vo.commitId = UUIDUtils.generateUUID();
    vo.type = CommonConstant.MERGE_TYPE_CREATED;
    vo.modifyTime = new Date();
    const branchMerge = await this.branchMergeRepository.save(vo);
    return branchMerge.id;
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

    await this.diffKey(sourceKeyList, targetKeyList, mergeId, branchMerge.crosMerge);
  }

  /**
   * When the actualId of the key is equal, compare the name and values of the key
   * @param source Source branches all keys, key names and their translations in different languages
   * @param target Target branches all keys, key names and their translations in different languages
   * @param mergeId branch merge id
   */
  private async diffKey(source: KeyValueDetailVO[], target: KeyValueDetailVO[], mergeId: number, crosmerge: boolean) {
    for (let i = 0; i < source.length; i++) {
      const sourceKey = source[i];

      let targetKey = new KeyValueDetailVO();
      let isExist = false;
      let isDifferent = false;
      let hasTarget = false;
      let targetIndex = 0;

      if (target !== null && target.length > 0) {
        hasTarget = true;
        for (let j = 0; j < target.length; j++) {
          targetIndex = j;
          targetKey = target[j];
          if (sourceKey.keyActualId === targetKey.keyActualId) {
            isExist = true;
            if (sourceKey.keyName !== targetKey.keyName) {
              isDifferent = true;
            } else if (!(await this.checkValueVO(sourceKey.valueList, targetKey.valueList))) {
              isDifferent = true;
            }
            break;
          }
        }
      }

      /* When the name of the key is inconsistent or
         when the same translation value of the key is different or
         when only a certain branch is translated,
         need to add diffkey data */
      if (isDifferent || !isExist || !hasTarget) {
        let mergeDiffKey = new MergeDiffKey();
        mergeDiffKey.mergeId = mergeId;
        mergeDiffKey.key = sourceKey.keyActualId;
        mergeDiffKey = await this.mergeDiffKeyRepository.save(mergeDiffKey);
        let diffValueList: MergeDiffValue[] = [];
        if (sourceKey.valueList !== null && sourceKey.valueList.length > 0) {
          sourceKey.valueList.forEach(v => {
            let diffValue = new MergeDiffValue();
            diffValue.languageId = v.languageId;
            diffValue.mergeDiffKeyId = mergeDiffKey.id;
            diffValue.valueId = v.valueId;
            diffValue.keyId = sourceKey.keyId;
            diffValueList.push(diffValue);
          });
        }
        if (hasTarget && targetKey.valueList !== null && targetKey.valueList.length > 0) {
          targetKey.valueList.forEach(v => {
            let diffValue = new MergeDiffValue();
            diffValue.languageId = v.languageId;
            diffValue.mergeDiffKeyId = mergeDiffKey.id;
            diffValue.valueId = v.valueId;
            diffValue.keyId = targetKey.keyId;
            diffValueList.push(diffValue);
          });
        }
        if (diffValueList.length > 0) {
          await this.mergeDiffValueRepository.save(diffValueList);
        }
      }

      // When source and target have the same key, delete both sides to reduce the number of cycles
      if (isExist) {
        source.splice(i, 1);
        if (target.length > 0) {
          target.splice(targetIndex, 1);
        }
        i--;
      }
    }

    // When crosmerge is true, the branches need to be compared with each other
    if (crosmerge != null && crosmerge) {
      await this.diffKey(target, source, mergeId, false);
    }
  }

  /**
   * return true --> source === target / false source !== target
   * @param source
   * @param target
   */
  private async checkValueVO(source: ValueVO[], target: ValueVO[]): Promise<boolean> {
    const sourceEmtpy = (source === null || source.length === 0) && target !== null && target.length > 0;
    const targetEmpty = (target === null || target.length === 0) && source !== null && source.length > 0;
    if (sourceEmtpy || targetEmpty) {
      return false;
    } else {
      for (let i = 0; i < source.length; i++) {
        const s = source[i];
        let isExist = false;
        let isDifferent = false;
        for (let j = 0; j < target.length; j++) {
          const t = target[j];
          if (s.languageId === t.languageId) {
            isExist = true;
            if (s.value !== t.value) {
              isDifferent = true;
            }
            break;
          }
        }
        if (isDifferent || !isExist) {
          return false;
        } else {
          return true;
        }
      }
    }
    return true;
  }

  /**
   * merge
   * @param vo
   */
  async merge(vo: BranchMergeSubmitVO) {
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
    const crosMerge = branchMerge.crosMerge === null || !branchMerge.crosMerge ? false : true;

    // check all the merge diff key are selected!
    const mergeDiffList = await this.getDiffById(vo.mergeId);
    if (null === mergeDiffList || mergeDiffList.length === 0) {
      return;
    }

    branchMerge.type = CommonConstant.MERGE_TYPE_MERGING;
    await this.branchMergeRepository.save(branchMerge);

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
        await this.mergeKey(paramMergeDiff, branchMerge);
      } else {
        throw new BadRequestException(ErrorMessage.BRANCH_MERGE_DIFF_KEY_NOT_SELECT_ALL);
      }
    }

    branchMerge.type = CommonConstant.MERGE_TYPE_MERGED;
    await this.branchMergeRepository.save(branchMerge);
  }

  /**
   *
   * @param diffVO
   * @param crosMerge
   */
  private async mergeKey(diffVO: BranchMergeDiffVO, branchMerge: BranchMerge) {
    const time = new Date();
    const source = diffVO.source;
    const target = diffVO.target;
    const masterBranch = await this.branchService.findMasterBranchByProjectId(source.branchId);
    let masterBranchId = 0;
    if (masterBranch === null) {
      throw new BadRequestException(ErrorMessage.BRANCH_NOT_EXIST);
    } else {
      masterBranchId = masterBranch.id;
    }

    let selectedKey = new SelectedKeyDTO();
    const selectBranchId = diffVO.mergeDiffKey.selectBranchId;

    let sourceMaster = false;
    let tragetMaster = false;

    if (masterBranchId === source.branchId) {
      sourceMaster = true;
    } else if (masterBranchId === target.branchId) {
      tragetMaster = true;
    }

    if (selectBranchId === source.branchId) {
      selectedKey = await this.getSelectedMergeInfo(source);
    } else {
      selectedKey = await this.getSelectedMergeInfo(target);
    }

    // save branch commit data
    let branchCommit = new BranchCommit();
    branchCommit.branchId = target.branchId;
    branchCommit.commitId = branchMerge.commitId;
    branchCommit.commitTime = new Date();
    branchCommit.type = CommonConstant.COMMIT_TYPE_MERGE;
    await this.branchCommitRepository.save(branchCommit);

    if(branchMerge.crosMerge !== null && branchMerge.crosMerge){
      branchCommit.branchId = source.branchId;
      branchCommit.commitId = branchMerge.commitId;
      branchCommit.commitTime = time;
      branchCommit.type = CommonConstant.COMMIT_TYPE_MERGE;
      await this.branchCommitRepository.save(branchCommit);
    }

    // master -> branch1
    if(sourceMaster && !tragetMaster){

    } else if (!sourceMaster && tragetMaster){
      // branch1 -> master

    } else {
      // branch1 -> branch2

    }

    // save keyname
    let keyName = await this.keynameRepository.findOne(target.keyNameId);
    keyName.name = selectedKey.keyName;
    keyName.commitId = branchMerge.commitId;
    keyName.modifyTime = time;
    await this.keynameRepository.save(keyName);

    // save value
    let valueList: Keyvalue[] = [];
    for (let i = 0; i < selectedKey.valueList.length; i++) {
      const value = selectedKey.valueList[i];
      let keyvalue = await this.keyvalueRepository.findOne(value.valueId);
      keyvalue.latest = false;
      await this.keyvalueRepository.save(keyvalue);

      let newValue = JSON.parse(JSON.stringify(keyvalue));
      newValue.id = null;
      newValue.value = value.value;
      newValue.commitId = branchMerge.commitId;
      newValue.latest = true;
      newValue.modifyTime = time;
      newValue.mergeId = branchMerge.id;
      valueList.push(newValue);
    }
    await this.keyvalueRepository.save(valueList);
  }

  /**
   * According to MergeDiffShowVO, the values corresponding to the selected key and value are obtained
   * @param dto The key and value data selected for the page
   * @returns SelectedKeyDTO
   */
  private async getSelectedMergeInfo(dto: MergeDiffShowVO): Promise<SelectedKeyDTO> {
    let result = new SelectedKeyDTO();
    result.keyId = dto.keyId;
    result.keyName = dto.keyName;
    result.keyNameId = dto.keyNameId;

    let valueList: SelectedValueDTO[] = [];
    dto.valueList.forEach(v => {
      let value = new SelectedValueDTO();
      value.valueId = v.id;
      value.value = v.value;
      value.languageId = v.languageId;
      valueList.push(value);
    });
    result.valueList = valueList;
    return result;
  }
}
