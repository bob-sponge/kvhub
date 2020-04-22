/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { Namespace } from 'src/entities/Namespace';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchService } from '../branch/branch.service';
import { KeyService } from '../key/key.service';
import { ProjectLanguageService } from '../projectLanguage/projectLanguage.service';
import { NamespaceService } from '../namespace/namespace.service';
import { Dashboard } from 'src/vo/Dashboard';
import { ProjectViewVO } from 'src/vo/ProjectViewVO';
import { ProjectLanguageDTO } from 'src/dto/ProjectLanguageDTO';
import { NamespaceVO } from '../../vo/NamespaceVO';
import { ProjectVO } from 'src/vo/PorjectVO';
import { ProjectLanguage } from 'src/entities/ProjectLanguage';
import { LanguagesService } from '../languages/languages.service';
import { Branch } from 'src/entities/Branch';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Namespace)
    private readonly namespaceRepostiory: Repository<Namespace>,
    private readonly branchService: BranchService,
    private readonly keyService: KeyService,
    private readonly projectLanguageService: ProjectLanguageService,
    private readonly namespaceService: NamespaceService,
    private readonly languageService: LanguagesService,
  ) {}

  /**
   * 获取首页相关数据
   */
  async findAllPorjects(): Promise<Dashboard[]> {
    const projects: any[] = await this.findProjectWithBranch();
    const languages: any[] = await this.findProjectWithLanguages();
    const keysMap: any[] = await this.keyService.countKey();
    return await this.consolidateData(projects, languages, keysMap);
  }

  async saveProject(projectVO: ProjectVO): Promise<boolean> {
    if (await this.languageService.findOne(projectVO.referenceId)) {
      return false;
    }
    // save project
    let project = new Project();
    project.name = projectVO.name;
    project.referenceLanguageId = projectVO.referenceId;
    project.modifyTime = new Date();
    project.delete = false;
    // 暂定
    project.type = 'i18n';
    project.modifier = 'admin';
    const savedProject: Project = await this.projectRepository.save(project);

    // save middle table
    let projectLanguage = new ProjectLanguage();
    projectLanguage.projectId = savedProject.id;
    projectLanguage.languageId = savedProject.referenceLanguageId;
    projectLanguage.delete = false;
    projectLanguage.modifier = 'admin';
    projectLanguage.modifyTime = new Date();
    await this.projectLanguageService.save(projectLanguage);

    //save branch
    let branch = new Branch();
    branch.name = 'master';
    branch.projectId = savedProject.id;
    branch.master = true;
    branch.modifier = 'admin';
    branch.modifyTime = new Date();
    await this.branchService.save(branch);
    return true;
  }
  /**
   * 整合数据返回Dashborad[]
   * @param projects
   * @param languages
   * @param keysMap
   */
  private async consolidateData(projects: any[], languages: any[], keysMap: any[]): Promise<Dashboard[]> {
    const dashboards: Dashboard[] = [];
    // 获取project_ids
    const ids = new Set();
    projects.forEach(p => {
      ids.add(p.project_id);
    });

    // project -> dashboard
    ids.forEach(id => {
      let d = new Dashboard();
      let keysArray = [];
      // key是否有效暂定由actual_id决定
      let actualIds = new Set();
      projects.map(p => {
        if (id === p.id) {
          d.id = p.id;
          d.name = p.project_name;
          d.time = p.modify_time;
          d.modifier = p.modifier;
          // 在key表sql中筛选了actual_id = id的数据
          actualIds.add(p.actual_id);
          keysArray.push(p.actual_id);
        }
      });
      d.KeysNumber = actualIds.size;
      d.keys = keysArray;
      dashboards.push(d);
    });

    // dashboard -> languages
    dashboards.map(d => {
      let languageArray = [];
      languages.map(l => {
        if (d.id === l.project_id) {
          languageArray.push(l.language_name);
        }
        d.languages = languageArray.sort();
      });
    });

    // 获取已翻译的数据(由project下的language和对应的key的value共同决定)
    dashboards.map(a => {
      let translatedCount = 0;
      let translatedArray = [];
      a.keys.forEach(k => {
        keysMap.forEach(x => {
          if (k === x.id && a.languages.length === parseInt(x.count)) {
            translatedCount++;
            translatedArray.push(k);
          }
        });
      });
      a.translatedKeysNumber = translatedCount;
      a.translatedKeys = translatedArray;
    });
    return dashboards;
  }

  // project left join branch(only master branch)
  async findProjectWithBranch(): Promise<any[]> {
    return await this.projectRepository.query(
      'SELECT x.*, y.* FROM (SELECT p.id, p.name as project_name, p.modifier, p.modify_time, p.type, ' +
        'b.id as branch_id FROM project p LEFT JOIN branch b ON p.id = b.project_id WHERE p.delete = FALSE' +
        ' AND b.master = TRUE ORDER BY p.id) x LEFT JOIN (SELECT a.project_id, a.name as branch_name, ' +
        'a.master as is_master, key.id as key_id, key.actual_id, key.namespace_id FROM (SELECT * FROM ' +
        'branch LEFT JOIN branch_key ON branch.id = branch_key.branch_id WHERE branch_key.delete = FALSE ' +
        'AND branch.master = TRUE) a LEFT JOIN key ON a.key_id = key.id WHERE key.delete = FALSE AND key.id ' +
        '= key.actual_id) y ON x.id = y.project_id ORDER BY x.id',
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
  async getProjectView(id: number, branchId: number): Promise<ProjectViewVO[]> {
    const result: ProjectViewVO[] = [];
    const projectLanguageList: ProjectLanguageDTO[] = await this.projectLanguageService.findByProjectId(id);
    const namespaceList: Namespace[] = await this.namespaceService.findByProjectId(id);
    projectLanguageList.forEach(p => {
      let vo = new ProjectViewVO();
      let namespaceVOList: NamespaceVO[];
      let totalKeys: number = 0;
      let tranferKeys: number = 0;
      vo.id = p.id;
      vo.languageName = p.languageName;
      namespaceList.forEach(n => {
        let namespaceVO = new NamespaceVO();
        namespaceVO.id = n.id;
        namespaceVO.name = n.name;
        this.keyService.count(branchId, n.id).then(value => (namespaceVO.totalKeys = value));
        totalKeys += namespaceVO.totalKeys;
        tranferKeys += namespaceVO.translatedKeys;
        namespaceVOList.push(namespaceVO);
      });
      vo.namespaceList = namespaceVOList;
      vo.totalKeys = totalKeys;
      vo.translatedKeys = tranferKeys;
      result.push(vo);
    });
    return result;
  }
}
