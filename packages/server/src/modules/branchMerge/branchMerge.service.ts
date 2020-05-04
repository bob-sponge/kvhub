import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchMerge } from 'src/entities/BranchMerge';
import { Repository } from 'typeorm';
import { BranchMergeSearchVO } from 'src/vo/BranchMergeSearchVO';
import { BranchMergeVO } from 'src/vo/BranchMergeVO';
import { BranchService } from 'src/modules/branch/branch.service'
import { Branch } from 'src/entities/Branch';

@Injectable()
export class BranchMergeService {
  constructor(
    @InjectRepository(BranchMerge) 
    private readonly branchMergeReposttory: Repository<BranchMerge>,
    private readonly branchService: BranchService,) {}

  async list(vo:BranchMergeSearchVO): Promise<BranchMergeVO[]> {
    let result : BranchMergeVO[];
    // 根据传入的projectid和关键字，查找分支
    let branchList : Branch[] = await this.branchService.findBranchByProjectIdAndKeyword(vo.projectId,vo.keywrod);

    // 得到分支集合后，获取分支的id并进行拼接
    let branchIds :string = '';
    branchList.forEach(branch => {branchIds+=branchIds+branch.id+','});
    branchIds = branchIds.substring(0,branchIds.length - 1);

    // 拼接分支id后，通过sql查找到项目的分支merge记录，source 和 target 都需要进行查找
    let branchMergeList : BranchMerge[] =  await this.branchMergeReposttory.createQueryBuilder('branch_merge')
    .where('branch_merge.source_branch_id in (:branchIds) and branch.target_branch_id in (:branchIds)')
    .setParameters({branchIds}).getMany();

    // 得到记录后，按照source和target分支id获取对应的分支名称
    for(let i=0;i<branchMergeList.length;i++){
      let branchMergeVO : BranchMergeVO;
      const branchMerge = branchMergeList[i];

      branchMergeVO.id = branchMerge.id;
      branchMergeVO.sourceBranchId = branchMerge.sourceBranchId;
      branchMergeVO.targetBranchId = branchMerge.targetBranchId;
      branchMergeVO.type = branchMerge.type;
      branchMergeVO.crosMerge = branchMerge.crosMerge;
      branchMergeVO.commitId = branchMerge.commitId;

      for (let j = 0;j<branchList.length;j++){
        const branch = branchList[j];
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
}
