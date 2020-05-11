import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/entities/Branch';
import { Repository, DeleteResult } from 'typeorm';
import { Project } from 'src/entities/Project';
import { ConfigService } from '@ofm/nestjs-utils';
import { Page } from 'src/vo/Page';
import { PageResult } from 'src/vo/PageResult';
import { PageSearch } from 'src/vo/PageSearch';
import { BranchMerge } from 'src/entities/BranchMerge';
import { BranchBody } from 'src/vo/BranchBody';
import { BranchVO } from 'src/vo/BranchVO';
import { CompareVO } from 'src/vo/CompareVO';
import { KeyVO } from 'src/vo/KeyVO';
import { MergeDiffChangeKey } from 'src/entities/MergeDiffChangeKey';
import { KeyValueVO } from 'src/vo/KeyValueVO';
import { CompareBranchVO } from 'src/vo/CompareBranchVO';

@Injectable()
export class BranchService {
  private constant: Map<string, string>;
  constructor(
    @InjectRepository(Branch) private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(BranchMerge) private readonly branchMergeRepository: Repository<BranchMerge>,
    @InjectRepository(MergeDiffChangeKey) private readonly mergeDiffChangeKeyRepository: Repository<MergeDiffChangeKey>,
    private readonly config: ConfigService,
  ) {
    this.constant = new Map([
      ['0', 'Open'],
      ['1', 'Merged'],
      ['2', 'Refused'],
    ]);
  }

  /**
   * 不同branch间key的value比较
   * @param compareVO compareVO
   */
  async compare(compareVO: CompareVO): Promise<CompareBranchVO[]> {
    const ids = [compareVO.source, compareVO.destination];
    const branchs: Branch[] = await this.branchRepository.findByIds(ids);
    if (branchs.length !== 2) {
      throw new BadRequestException('branchId is not exist');
    }
    let source = new CompareBranchVO();
    let destination = new CompareBranchVO();
    source.id = compareVO.source;
    source.keys = await this.getValueByBranchId(compareVO.source);
    destination.id = compareVO.destination;
    destination.keys = await this.getValueByBranchId(compareVO.destination);
    return [source, destination];
  }

  /**
   * 找出string不同的地方并高亮显示
   * @param source source
   * @param destination destination
   */
  async getDiff(source: string, destination: string): Promise<string> {
    if (source === destination) {
      return destination;
    }
    if (source === '' && destination !== '') {
      return '';
    }
    // eslint-disable-next-line prettier/prettier
    const prefix = '<span style=\'color:blue\'>';
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
   * 查询branchId对应的key name & value
   * @param branchId branchId
   */
  async getValueByBranchId(branchId: number): Promise<KeyVO[]> {
    // 获取全部的branch
    const branches: Branch[] = await this.getAllBranch(branchId);
    // 判断对应的branchVO
    const branchVOs: BranchVO[] = await this.calculateMerge(branches);
    // 根据branchVO中merge参数不同查询不同的表并进行参数封装
    let keyVOs: KeyVO[] = [];
    for (let index = 0; index < branchVOs.length; index++) {
      const b = branchVOs[index];
      // 通过branchId查询keyIds
      const keys = await this.findKeyIdsByBranchIds(b.id);
      if (keys.length === 0) {
        return keyVOs;
      }
      let keyIds = [];
      keys.forEach(k => {
        keyIds.push(k.key_id);
      });
      // 通过keyIds查询对应的name和value
      const result: any[] = await this.findKeysByKeyIds('(' + keyIds.join(',') + ')');
      let ids = new Set<number>();
      result.map(r => {
        ids.add(r.id);
      });

      ids.forEach(i => {
        let keyVO = new KeyVO();
        let values = [];
        result.forEach(r => {
          if (i === r.id) {
            keyVO.name = r.name;
            let keyValue = new KeyValueVO();
            keyValue.value = r.value;
            keyValue.language = r.language_name;
            values.push(keyValue);
          }
        });
        keyVO.values = values;
        keyVOs.push(keyVO);
      });
    }
    return keyVOs.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 通过传入的 branch id 查找其对应 project下的 master branch
   * @param id branch id
   */
  async getAllBranch(id: number): Promise<Branch[]> {
    const branch: Branch = await this.branchRepository.findOne({ id: id });
    if (branch.master) {
      return Array.of(branch);
    }
    const branches: Branch[] = await this.branchRepository.query(
      `SELECT * FROM branch WHERE project_id = (SELECT project_id FROM branch WHERE id = '${id}') AND master=true`,
    );
    let result = [branch];
    branches.forEach(a => {
      let b = new Branch();
      b.id = a.id;
      b.master = a.master;
      b.name = a.name;
      b.projectId = a.projectId;
      b.modifier = a.modifier;
      b.modifyTime = a.modifyTime;
      result.push(b);
    });
    return result;
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
  async findByCondition(pageSearch: PageSearch): Promise<PageResult> {
    const start: number = (pageSearch.page - 1) * pageSearch.size;
    let result = new PageResult();
    // 查询不区分大小写
    const data: Branch[] = await this.branchRepository
      .createQueryBuilder('branch')
      .where('branch.name Like :name')
      .setParameters({
        name: '%' + pageSearch.content + '%',
      })
      .orderBy('branch.modify_time')
      .limit(pageSearch.size)
      .offset(start)
      .getMany();
    result.total = data.length;
    result.page = pageSearch.page;
    result.size = pageSearch.size;
    result.data = await this.calculateMerge(data);
    return result;
  }

  /**
   * 获取branch merge参数状态
   * @param data data
   */
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
   * 通过项目id查询分支
   * @param projectId
   */
  async findBranchByProjectIdAndKeyword(projectId: number, keyword: string): Promise<Branch[]> {
    return await this.branchRepository
      .createQueryBuilder('branch')
      .where('branch.name Like :name and branch.project_id = :projectId')
      .setParameters({
        projectId,
        name: '%' + keyword + '%',
      })
      .getMany();
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
        'a on k.key_id = a.key_id WHERE a.latest = true AND k.id in ' +
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
