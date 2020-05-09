import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository, DeleteResult } from 'typeorm';
import { BranchKey } from 'src/entities/BranchKey';
import { Project } from 'src/entities/Project';
import { ConfigService } from '@ofm/nestjs-utils';
import { Page } from 'src/vo/Page';
import { PageResult } from 'src/vo/PageResult';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchBody } from 'src/vo/BranchBody';
import { BranchVO } from 'src/vo/BranchVO';
import { CompareVO } from 'src/vo/CompareVO';

@Injectable()
export class BranchService {
  private constant: Map<string, string>;
  constructor(
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(BranchKey) private readonly branchKeyRepository: Repository<BranchKey>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(BranchMerge) private readonly branchMergeRepository: Repository<BranchMerge>,
    private readonly config: ConfigService,
  ) {
    this.constant = new Map([
      ['0', 'Open'],
      ['1', 'Merged'],
      ['2', 'Refused'],
    ]);
  }

  async compare(compareVO: CompareVO): Promise<void> {
    const ids = [compareVO.branchIdOne, compareVO.branchIdTwo];
    const branchs: Branch[] = await this.branchRepository.findByIds(ids);
    if (branchs.length !== 2) {
      throw new BadRequestException('branchId is not exist');
    }
    const oneSet = await this.getAllBranchId(compareVO.branchIdOne);
    const twoSet = await this.getAllBranchId(compareVO.branchIdTwo);
    // 通过branch id 找key
  }

  /**
   * 通过传入的branch id 查找其对应project下的master branch
   * @param id branch id
   */
  async getAllBranchId(id: number): Promise<Set<number>> {
    const branch: Branch = await this.branchRepository.findOne({ id: id });
    const masterId: number = await this.branchRepository.query(
      'select id from branch where project_id = ' +
      '(select id from project where id = ' +
      `(select project_id from branch where id = '${branch.id}')) and master = true`);
    return new Set<number>([masterId, id]);;
  }
  /**
   * 分页返回branchs
   * @param page page
   */
  async findAllWithPage(page: Page): Promise<PageResult> {
    let pageResult = new PageResult();
    const start: number = (page.page - 1) * page.size;
    const total: number = await this.branchRepository.count();
    const data: Branch[] = await this.branchRepository
      .createQueryBuilder('branch')
      .orderBy('branch.modify_time')
      .limit(page.size)
      .offset(start)
      .getMany();

    pageResult.size = page.size;
    pageResult.page = page.page;
    pageResult.total = total;
    pageResult.data = await this.calculateMerge(data);
    return pageResult;
  }

  /**
   * 分页模糊查询
   * @param pageSearch pageSearch
   */
  async findByCondition(page: Page): Promise<PageResult> {
    const start: number = (page.page - 1) * page.size;
    let result = new PageResult();
    // 查询不区分大小写
    const data: Branch[] = await this.branchRepository
      .createQueryBuilder('branch')
      .where('branch.name Like :name')
      .setParameters({
        name: '%' + page.content + '%',
      })
      .orderBy('branch.modify_time')
      .limit(page.size)
      .offset(start)
      .getMany();
    result.total = data.length;
    result.page = page.page;
    result.size = page.size;
    result.data = await this.calculateMerge(data);
    return result;
  }

  async calculateMerge(data: Branch[]): Promise<BranchVO[]> {
    // merge table source & target 都不存在
    const mergeResult: BranchMerge[] = await this.branchMergeRepository.find();
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
      branchVO.time = d.modifyTime;
      // 默认是 0 -> open
      branchVO.merge = this.constant.get('0');
      map.forEach((x, y) => {
        if (y === d.id) {
          branchVO.merge = this.constant.get(x.type);
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
   * 保存branch,默认创建master
   * @param branchBody branchBody
   */
  async save(branchBody: BranchBody): Promise<void> {
    // 判断project_id 是否存在
    if ((await this.projectRepository.findOne({ id: branchBody.projectId })) === undefined) {
      throw new BadRequestException('project_id is not exist');
    }
    await this.branchRepository.save({
      name: branchBody.name,
      projectId: branchBody.projectId,
      master: false,
      modifier: this.config.get('constants', 'modifier'),
      modifyTime: new Date(),
    });
  }

  /**
   * 根据id删除branch
   * @param id id
   */
  async deleteBranch(id: number): Promise<void> {
    const result: DeleteResult = await this.branchRepository.delete({ id: id });
    if (result.affected.toString() !== '1') {
      throw new BadRequestException('delete branch error');
    }
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
   * @param projectId projectId
   */
  async findMasterBranchByProjectId(projectId: number): Promise<Branch[]> {
    return await this.branchRepository.find({ projectId, master: true });
  }

  /**
   * 通过分支ID获取分支信息
   */
  async getBranchById(id: number): Promise<Branch> {
    return await this.branchRepository.findOne(id);
  }
}
