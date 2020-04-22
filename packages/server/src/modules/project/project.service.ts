/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { Namespace } from 'src/entities/Namespace';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchService } from '../branch/branch.service';
import { KeyService } from '../key/key.service';
import { ProjectLanguageService} from '../projectLanguage/projectLanguage.service';
import { NamespaceService} from '../namespace/namespace.service';
import { Dashboard } from 'src/vo/Dashboard';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';
import { ProjectLanguageDTO } from 'src/dto/ProjectLanguageDTO';
import { NamespaceVO } from '../../vo/NamespaceVO';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Namespace)
    private readonly namespaceRepostiory: Repository<Namespace>,
    private readonly branchService: BranchService,
    private readonly keyService: KeyService,
    private readonly projectLanguageService : ProjectLanguageService,
    private readonly namespaceService : NamespaceService
  ) {}

  async findAllPorjects(): Promise<Dashboard[]> {
    const projects: any[] = await this.findProjectWithBranch();
    const languages: any[] = await this.findProjectWithLanguages();
    const keys: any[] = await this.keyService.findKeyWithKeyValue();
    const ids = new Set();
    const dashboards: Dashboard[] = [];
    // project_ids
    projects.forEach(p => {
      ids.add(p.project_id);
    });

    // project -> dashboard
    ids.forEach(id => {
      let d = new Dashboard();
      // store actual_id
      let actualIds = new Set();
      let keysArray = [];
      projects.forEach(p => {
        if (id === p.id) {
          d.id = p.id;
          d.name = p.project_name;
          d.time = p.modify_time;
          d.modifier = p.modifier;
          keysArray.push(p.key_id);
          actualIds.add(p.actual_id);
        }
      });
      d.totalKeys = actualIds.size;
      d.keyIds = keysArray.sort((a, b) => a - b);
      dashboards.push(d);
    });

    // dashboard -> languages
    dashboards.forEach(d => {
      let languageArray = [];
      languages.forEach(l => {
        if (d.id === l.project_id) {
          languageArray.push(l.language_name);
        }
        d.languages = languageArray.sort();
      });
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

  // project left join language
  async findProjectWithLanguages(): Promise<any[]> {
    return await this.projectRepository.query(
      'SELECT p.id as project_id, p.name as project_name, p.reference_language_id, ' +
        'p.type, p.modifier, p.modify_time, b.language_id, b.name as language_name FROM' +
        ' project p LEFT JOIN (SELECT pl.project_id,pl.language_id,l."name" FROM ' +
        'project_language pl LEFT JOIN language l on l.id = pl.language_id WHERE ' +
        'pl.delete = FALSE) b ON p.id = b.project_id WHERE p.delete = FALSE ORDER BY p.id',
    );
  }

  /**
   * 通过项目id获取项目详情
   */
  async getProjectView(id:number,branchId:number): Promise<ProjectViewVO[]> {
    const result : ProjectViewVO[] = [];
    const projectLanguageList : ProjectLanguageDTO[] = await this.projectLanguageService.findByProjectId(id); 
    const namespaceList : Namespace[] = await this.namespaceService.findByProjectId(id);
    projectLanguageList.forEach(p => {
      let vo = new ProjectViewVO();
      let namespaceVOList : NamespaceVO[];
      let totalKeys : number = 0;
      let tranferKeys : number = 0;
      vo.id = p.id;
      vo.languageName = p.languageName;
      namespaceList.forEach(n => {
        let namespaceVO = new NamespaceVO();
        namespaceVO.id = n.id;
        namespaceVO.name = n.name;
        this.keyService.countKey(branchId,n.id).then(value => namespaceVO.totalKeys = value);
        totalKeys += namespaceVO.totalKeys;
        tranferKeys += namespaceVO.translatedKeys;
        namespaceVOList.push(namespaceVO);
      })
      vo.namespaceList = namespaceVOList;
      vo.totalKeys = totalKeys;
      vo.translatedKeys = tranferKeys;
      result.push(vo);
    });
    return result;
  }
}
