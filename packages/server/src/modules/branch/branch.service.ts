import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository } from 'typeorm';
import { BranchKey } from 'src/entities/BranchKey';
import { BranchVO } from 'src/vo/BranchVO';
import { Project } from 'src/entities/Project';
import { ConfigService } from '@ofm/nestjs-utils';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchKey) private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    private readonly config: ConfigService,
  ) {}

  // 返回branch list
  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find();
  }

  /**
   * 通过项目id查询分支
   * @param projectId
   */
  async findBranchByProjectId(projectId: number): Promise<Branch[]> {
    return await this.branchRepository.find({ projectId });
  }

  async save(branchVO: BranchVO): Promise<void> {
    if ((await this.projectRepository.findOne({ id: branchVO.projectId })) === undefined) {
      throw new BadRequestException('project_id is not exist');
    }
    await this.branchRepository.save({
      name: branchVO.name,
      project_id: branchVO.projectId,
      master: false,
      modifier: this.config.get('constants', 'modifier'),
      modify_time: new Date(),
    });
  }

  // branch branch_key key
  async findKeyWithBranch(): Promise<any[]> {
    return await this.branchRepository.query(
      'SELECT a.project_id, a.branch_id, a.name as branch_name, a.master as is_master, key.id as key_id, ' +
        'key.actual_id, key.namespace_id FROM (SELECT * FROM branch LEFT JOIN branch_key ON ' +
        'branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE AND branch.master = TRUE) a ' +
        'LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE',
    );
  }
}
