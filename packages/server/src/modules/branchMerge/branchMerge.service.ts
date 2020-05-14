import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Branch } from 'src/entities/Branch';
import { BranchMerge } from 'src/entities/BranchMerge';
import { MergeDiffKey } from 'src/entities/MergeDiffKey';
import { MergeDiffValue } from 'src/entities/MergeDiffValue';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeVO } from 'src/vo/BranchMergeVO';
import { BranchMergeDiffVO } from 'src/vo/BranchMergeDiffVO';
import { MergeDiffShowVO } from 'src/vo/MergeDiffShowVO';
import { MergeDiffValueShowVO } from 'src/vo/MergeDiffValueShowVo';
import { BranchService } from 'src/modules/branch/branch.service'
import { KeyService } from 'src/modules/key/key.service'
import { CommonConstant } from 'src/constant/constant';
import { UUIDUtils } from 'src/utils/uuid';

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
    private readonly branchService: BranchService,
    private readonly keyService: KeyService
  ) { }

  async getInfoById(id: number): Promise<BranchMergeVO> {
    const branchMergeVO = new BranchMergeVO();
    const branchMerge = await this.branchMergeRepository.findOne(id);
    if (branchMerge === null) {
      throw new BadRequestException('branch merge is not exist');
    }
    branchMergeVO.id = branchMerge.id;
    branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
    branchMergeVO.targetBranchId = branchMerge.targetBranchId;
    branchMergeVO.type = branchMerge.type;
    branchMergeVO.crosMerge = branchMerge.crosMerge;
    branchMergeVO.commitId = branchMerge.commitId;

    const branchList = await this.branchRepository.find({ where: [{ id: branchMerge.sourceBranchId }, { id: branchMerge.targetBranchId }] });
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
      throw new BadRequestException('branch merge is not exist');
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
    branchList.forEach(branch => { branchIdList.push(branch.id) });

    // 拼接分支id后，通过sql查找到项目的分支merge记录，source 和 target 都需要进行查找
    let branchMergeList: BranchMerge[] = await this.branchMergeRepository.find({ where: [{ sourceBranchId: In(branchIdList) }, { targetBranchId: In(branchIdList) }] });

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

  async getDiffById(mergeId:number) : Promise<BranchMergeDiffVO[]> {
    const result : BranchMergeDiffVO[] = [];
    const branchMerge = await this.branchMergeRepository.findOne(mergeId);
    if ( branchMerge === undefined ){
      throw new BadRequestException('branch merge is not exist');
    }
    const sourceBranchId = branchMerge.sourceBranchId;
    const targetBranchId = branchMerge.targetBranchId;

    const mergeBranchKeyList = await this.mergeDiffKeyRepository.find({mergeId});
    if (mergeBranchKeyList === null || mergeBranchKeyList.length === 0){
      return result;
    }
    for (let i=0;i<mergeBranchKeyList.length;i++){
      let vo  = new BranchMergeDiffVO();
      vo.mergeDiffKey = mergeBranchKeyList[i];
      vo.keyActualId = vo.mergeDiffKey.key;
      vo.source = await this.getMergeDiffInfo(vo.mergeDiffKey.id,sourceBranchId,vo.mergeDiffKey.key);  
      vo.target = await this.getMergeDiffInfo(vo.mergeDiffKey.id,targetBranchId,vo.mergeDiffKey.key);
      result.push(vo);
    }
    return result;
  }
  private async getMergeDiffInfo(mergeDiffKeyId:number,branchId:number,keyActualId:number) : Promise<MergeDiffShowVO> {
    let vo = new MergeDiffShowVO();
    let valueList : MergeDiffValueShowVO[] = []
    let key = await this.keyService.getKeyByBranchIdAndKeyActualId(branchId,keyActualId);
    if (key === undefined){
      throw new BadRequestException("key is not exist!");
    } else {
      vo.keyId = key.id;
    }
    
    // key -> keyname
    const keyName = await this.keyService.getKeyInfo(key.id,false);
    vo.keyName = keyName.name;

    // 获取value
    const mergeDiffValueList = await this.mergeDiffValueRepository.find({mergeDiffKeyId});
    for (let i = 0;i<mergeDiffValueList.length;i++){
      let valueShowVO = new MergeDiffValueShowVO();
      const mergeDiffValue = mergeDiffValueList[i];
      valueShowVO.id = mergeDiffValue.valueId;
      valueShowVO.keyId = key.id;

      let value = await this.keyService.getValueInfo(valueShowVO.id);
      valueShowVO.languageId = value.languageId;
      valueShowVO.languageName = value.langeuage;
      valueShowVO.value = value.value;
      valueList.push(valueShowVO);
    }
    valueList.sort((v1,v2) => v1.languageId - v2.languageId);
    vo.valueList = valueList;
    return vo;
  }
  
  async save(vo: BranchMerge): Promise<number> {
    if (vo.sourceBranchId !== null && vo.sourceBranchId !== undefined) {
      const branch = await this.branchService.getBranchById(vo.sourceBranchId);
      if (branch === undefined) {
        throw new BadRequestException('source branch does not exist!');
      } else {
        const existBranchMerge =
          await this.branchMergeRepository.find({ where: [{ sourceBranchId: vo.sourceBranchId, type: '0' }, { targetBranchId: vo.sourceBranchId, type: '0' }] });
        if (existBranchMerge !== null && existBranchMerge.length > 0) {
          throw new BadRequestException('source branch is merging !');
        }
      }
    } else {
      throw new BadRequestException('source branch does not choose!');
    }

    if (vo.targetBranchId !== null && vo.targetBranchId !== undefined) {
      const branch = await this.branchService.getBranchById(vo.targetBranchId);
      if (branch === undefined) {
        throw new BadRequestException('target branch does not exist!');
      } else {
        const existBranchMerge =
          await this.branchMergeRepository.find({ where: [{ sourceBranchId: vo.targetBranchId, type: '0' }, { targetBranchId: vo.targetBranchId, type: '0' }] });
        if (existBranchMerge !== null && existBranchMerge.length > 0) {
          throw new BadRequestException('target branch is merging !');
        }
      }
    } else {
      throw new BadRequestException('target branch does not choose!');
    }

    vo.commitId = UUIDUtils.generateUUID();
    vo.type = CommonConstant.MERGE_TYPE_CREATED;
    vo.modifyTime = new Date();
    const branchMerge = await this.branchMergeRepository.save(vo);
    return branchMerge.id;
  }

  async generateDiffKey(mergeId : number) {
    const branchMerge = await this.branchMergeRepository.findOne(mergeId);
    
  }

}
