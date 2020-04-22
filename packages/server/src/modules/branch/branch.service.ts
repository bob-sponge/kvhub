import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository } from 'typeorm';
import { BranchKey } from 'src/entities/BranchKey';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchKey) private readonly branchKeyRepository: Repository<BranchKey>,
  ) {}

  // branch branch_key key
  async findKeyWithBranch(): Promise<any[]> {
    return await this.branchRepository.query(
      'SELECT a.project_id, a.branch_id, a.name as branch_name, a.master as is_master, key.id as key_id, ' +
        'key.actual_id, key.namespace_id FROM (SELECT * FROM branch LEFT JOIN branch_key ON ' +
        'branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE AND branch.master = TRUE) a ' +
        'LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE',
    );
  }

  // 查询branch and中间表
  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find();
  }

  /**
   * 通过项目id查询分支
   * @param projectId 
   */
  async findBranchByProjectId(projectId:number) : Promise<Branch[]> {
    return await this.branchRepository.find({projectId});
  }
}
