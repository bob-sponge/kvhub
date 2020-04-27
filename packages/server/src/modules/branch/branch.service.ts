import { Injectable, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository, DeleteResult } from 'typeorm';
import { BranchKey } from 'src/entities/BranchKey';
import { BranchVO } from 'src/vo/BranchVO';
import { Project } from 'src/entities/Project';
import { ConfigService } from '@ofm/nestjs-utils';
import { Page } from 'src/vo/Page';
import { PageResult } from 'src/vo/PageResult';
import { PageSearch } from 'src/vo/PageSearch';
import { BranchMerge } from 'src/entities/BranchMerge';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchKey) private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(BranchMerge) private readonly branchMergeRepository: Repository<BranchMerge>,
    private readonly config: ConfigService,
  ) { }

  // 返回branch list
  async findAllWithPage(page: Page): Promise<PageResult> {
    let result = new PageResult();
    const start: number = (page.page - 1) * page.size;
    const total: number = await this.branchRepository.count();
    const data = await this.branchRepository.query(
      `SELECT * FROM branch ORDER by modify_time LIMIT '${page.size}' OFFSET '${start}'`);
    result.size = page.size;
    result.page = page.page;
    result.total = total;
    result.data = data;
    // merge table source & target 都不存在
    // await this.branchMergeRepository.query(`SELECT * FROM branch_merge WHERE source_branch_id = '${}'`)
    return result;
  }

  async deleteBranch(id: number): Promise<void> {
    const result: DeleteResult = await this.branchRepository.delete({ id: id });
    if (result.affected.toString() !== '1') {
      throw new BadRequestException('delete branch error');
    }
  }

  async findByCondition(pageSearch: PageSearch): Promise<PageResult> {
    const start: number = (pageSearch.page - 1) * pageSearch.size;
    let result = new PageResult();
    // 查询不区分大小写
    const data: Branch[] = await this.branchRepository.query(
      `SELECT * FROM branch WHERE name ~* '${pageSearch.content}' LIMIT '${pageSearch.size}' OFFSET '${start}'`)
    result.total = data.length;
    result.page = pageSearch.page;
    result.size = pageSearch.size;
    result.data = data;
    return result;
  }

  /**
   * 通过项目id查询分支
   * @param projectId
   */
  async findBranchByProjectId(projectId: number): Promise<Branch[]> {
    return await this.branchRepository.find({ projectId });
  }

  async save(branchVO: BranchVO): Promise<void> {
    // 判断project_id 是否存在
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

  /**
   * 通过项目id查询master分支
   * @param projectId 
   */
  async findMasterBranchByProjectId(projectId:number) : Promise<Branch[]> {
    return await this.branchRepository.find({projectId,master:true});
  }

  /**
   * 通过分支ID获取分支信息
   */
  async getBranchById(id:number) : Promise<Branch>{
    return await this.branchRepository.findOne(id);
  }
}
