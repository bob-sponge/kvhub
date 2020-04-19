/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchService } from '../branch/branch.service';
import { KeyService } from '../key/key.service';
import { Dashboard } from 'src/vo/Dashboard';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly branchService: BranchService,
    private readonly keyService: KeyService,
  ) {}

  async findAllPorjects(): Promise<Dashboard[]> {
    const projects: any[] = await this.findProjectWithBranch();
    const ids = new Set();
    const dashboards: Dashboard[] = [];
    // project_ids
    projects.forEach(p => {
      ids.add(p.project_id);
    });
    ids.forEach(id => {
      let d = new Dashboard();
      // store actual_id
      let actualIds = new Set();
      projects.forEach(p => {
        if (id === p.id) {
          d.id = p.id;
          d.name = p.project_name;
          d.time = p.modify_time;
          d.modifier = p.modifier;
          actualIds.add(p.actual_id);
        }
      });
      d.totalKeys = actualIds.size;
      dashboards.push(d);
    });
    return dashboards;
  }

  // project left join branch(only master branch)
  async findProjectWithBranch(): Promise<any[]> {
    return await this.projectRepository.query(
      'SELECT x.*, y.* FROM (SELECT p.id, p.name as project_name, p.modifier, p.modify_time, p.type, b.id as branch_id ' +
        'FROM project p LEFT JOIN branch b ON p.id = b.project_id WHERE p.delete = FALSE AND b.master = TRUE ORDER BY p.id) x ' +
        'LEFT JOIN (SELECT a.project_id, a.name as branch_name, a.master as is_master, key.id as key_id, key.actual_id, ' +
        'key.namespace_id FROM (SELECT * FROM branch LEFT JOIN branch_key ON branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE ' +
        'AND branch.master = TRUE) a LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE) y ON x.id = y.project_id ORDER BY x.id',
    );
  }
}
