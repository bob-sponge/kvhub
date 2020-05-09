import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Repository, In } from 'typeorm';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeVO } from 'src/vo/BranchMergeVO';
import { BranchService } from 'src/modules/branch/branch.service'
import { Branch } from 'src/entities/Branch';
import { CommonConstant } from 'src/constant/constant';

@Injectable()
export class BranchMergeService {
  constructor(
    @InjectRepository(BranchMerge) 
    private readonly branchMergeRepository: Repository<BranchMerge>,
    @InjectRepository(Branch) 
    private readonly branchRepository: Repository<Branch>,
    private readonly branchService: BranchService
    ) {}

  async getInfoById(id:number):Promise<BranchMergeVO> {
    const branchMergeVO = new BranchMergeVO();
    const branchMerge = await this.branchMergeRepository.findOne(id);
    if (branchMerge === null){
      throw new BadRequestException('branch merge is not exist');
    }
    branchMergeVO.id = branchMerge.id;
    branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
    branchMergeVO.targetBranchId = branchMerge.targetBranchId;
    branchMergeVO.type = branchMerge.type;
    branchMergeVO.crosMerge = branchMerge.crosMerge;
    branchMergeVO.commitId = branchMerge.commitId;

    const branchList = await this.branchRepository.find({where:[{id:branchMerge.sourceBranchId},{id:branchMerge.targetBranchId}]});
    branchList.forEach(branch => {
      if(branch.id === branchMergeVO.sourceBranchId){
        branchMergeVO.sourceBranchName = branch.name;
      }
      if(branch.id === branchMergeVO.targetBranchId){
        branchMergeVO.targetBranchName = branch.name;
      }
    });
    return branchMergeVO;
  }

  async refuse(id:number) {
    const branchMerge = await this.branchMergeRepository.findOne(id);
    if (branchMerge === null){
      throw new BadRequestException('branch merge is not exist');
    }
    branchMerge.type = CommonConstant.MERGE_TYPE_REFUSED;
    this.branchMergeRepository.save(branchMerge);
  }

  async list(vo:BranchMergeSearchVO): Promise<BranchMergeVO[]> {
    let result : BranchMergeVO[] = [];
    // 根据传入的projectid和关键字，查找分支
    let branchList : Branch[] = await this.branchService.findBranchByProjectIdAndKeyword(vo.projectId,vo.keywrod);
    const branchAllList : Branch[] = await this.branchService.findBranchByProjectId(vo.projectId);

    // 得到分支集合后，获取分支的id并进行拼接
    const branchIdList :number[] = [];
    branchList.forEach(branch => {branchIdList.push(branch.id)});

    // 拼接分支id后，通过sql查找到项目的分支merge记录，source 和 target 都需要进行查找
    let branchMergeList : BranchMerge[] =  await this.branchMergeRepository.find({where:[{sourceBranchId:In(branchIdList)},{targetBranchId:In(branchIdList)}]});

    // 得到记录后，按照source和target分支id获取对应的分支名称
    for(let i=0;i<branchMergeList.length;i++){
      let branchMergeVO = new BranchMergeVO();
      const branchMerge = branchMergeList[i];

      branchMergeVO.id = branchMerge.id;
      branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
      branchMergeVO.targetBranchId = branchMerge.targetBranchId;
      branchMergeVO.type = branchMerge.type;
      branchMergeVO.crosMerge = branchMerge.crosMerge;
      branchMergeVO.commitId = branchMerge.commitId;

      for (let j = 0;j<branchAllList.length;j++){
        const branch = branchAllList[j];
        if(branch.id === branchMergeVO.sourceBranchId){
          branchMergeVO.sourceBranchName = branch.name;
        }
        if(branch.id === branchMergeVO.targetBranchId){
          branchMergeVO.targetBranchName = branch.name;
        }
        if(branchMergeVO.sourceBranchName && branchMergeVO.targetBranchName){
          break;
        }
      }
      result.push(branchMergeVO);
    }
    return result;
  }

  // async getDiffById(id:number) : Promise<> {

  // }

  // async save (vo:BranchMerge) : Promise<number>{
  //   if(vo.)
  // }
}
