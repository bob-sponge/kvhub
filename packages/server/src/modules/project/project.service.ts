import { Injectable, BadRequestException } from '@nestjs/common';
import { Project } from 'src/entities/Project';
import { Namespace } from 'src/entities/Namespace';
import { Keyvalue } from 'src/entities/Keyvalue';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { ConfigService } from '@ofm/nestjs-utils';

@Injectable()
export class ProjectService {
  private projectType: string;
  private modifier: string = 'admin';
  private branchName: string = 'master';
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Keyvalue)
    private readonly keyValueRepository: Repository<Keyvalue>,
    private readonly branchService: BranchService,
    private readonly keyService: KeyService,
    private readonly projectLanguageService: ProjectLanguageService,
    private readonly namespaceService: NamespaceService,
    private readonly languageService: LanguagesService,
    private readonly config: ConfigService,
  ) {
    this.projectType = this.config.get('constants', 'project_type');
    this.branchName = this.config.get('constants', 'branch_name');
    this.modifier = this.config.get('constants', 'modifier');
  }

  async allProjects(): Promise<Project[]> {
    return await this.projectRepository.find({ delete: false });
  }

  /**
   * 获取首页相关数据
   */
  async dashboardPorjects(): Promise<Dashboard[]> {
    const projects: any[] = await this.findProjectWithBranch();
    const languages: any[] = await this.findProjectWithLanguages();
    const keysMap: any[] = await this.keyService.countKey();
    return await this.consolidateData(projects, languages, keysMap);
  }

  /**
   * 首页添加project
   * @param projectVO projectVO
   */
  async saveProject(projectVO: ProjectVO): Promise<void> {
    // language_id是否存在
    if (await this.languageService.findOne(projectVO.referenceId)) {
      throw new BadRequestException('referenceId is not exist');
    }
    // 判断名称是否重复
    if ((await this.projectRepository.findOne({ name: projectVO.name })) !== undefined) {
      throw new BadRequestException('project name is exist');
    }
    // save project
    let project = new Project();
    project.name = projectVO.name;
    project.referenceLanguageId = projectVO.referenceId;
    project.modifyTime = new Date();
    project.delete = false;
    // 暂定
    project.type = this.projectType;
    project.modifier = this.modifier;
    const savedProject: Project = await this.projectRepository.save(project);

    // save middle table
    let projectLanguage = new ProjectLanguage();
    projectLanguage.projectId = savedProject.id;
    projectLanguage.languageId = savedProject.referenceLanguageId;
    projectLanguage.delete = false;
    projectLanguage.modifier = this.modifier;
    projectLanguage.modifyTime = new Date();
    await this.projectLanguageService.save(projectLanguage);

    //save branch
    let branch = new Branch();
    branch.name = this.branchName;
    branch.projectId = savedProject.id;
    branch.master = true;
    branch.modifier = this.modifier;
    branch.modifyTime = new Date();
    await this.branchService.save(branch);
  }
  /**
   * 整合数据返回Dashborad[]
   * @param projects
   * @param languages
   * @param keysMap
   */
  async consolidateData(projects: any[], languages: any[], keysMap: any[]): Promise<Dashboard[]> {
    const dashboards: Dashboard[] = [];
    // 获取project_ids
    const ids = new Set();
    projects.forEach(p => {
      if (p.project_id !== null) {
        ids.add(p.project_id);
      }
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

  /**
   * 通过项目id获取项目详情
   */
  async getProjectView(id: number, branchId: number): Promise<ProjectViewVO[]> {
    let result = [];
    let isMasterBranch = false;
    let masterBranchId : number = 0;
    // 数据校验
    const project = await this.projectRepository.find({ id, delete: false });
    if (null === project || project.length === 0) {
      throw new BadRequestException('project is not exist');
    }
    const branch = await this.branchService.getBranchById(branchId);
    if (null === branch) {
      throw new BadRequestException('branch is not exist');
    } else {
      if (branch.master !== null && branch.master) {
        masterBranchId = branchId;
        isMasterBranch = true;
      } else {
        const branchList = await this.branchService.findMasterBranchByProjectId(id);
        if (branchList !== null && branchList.length > 0){
          masterBranchId = branchList[0].id;
        }
      }
    }

    //获取项目的语言
    let projectLanguageList: ProjectLanguageDTO[] = await this.projectLanguageService.findByProjectId(id);

    //获取项目的命名空间
    let namespaceList: Namespace[] = await this.namespaceService.findByProjectId(id);

    for (let i = 0; i < projectLanguageList.length; i++) {
      const p = projectLanguageList[i];
      let vo = new ProjectViewVO();
      let namespaceVOList: NamespaceVO[] = [];
      let totalKeys: number = 0;
      let totalTranferKeys: number = 0;
      vo.id = p.id;
      vo.languageName = p.languageName;
      for (let j = 0; j < namespaceList.length; j++) {
        const n = namespaceList[j];
        let namespaceVO = new NamespaceVO();

        let keyList : any[] = [];
        let masterKeyList = await this.keyService.getKeyWithBranchIdAndNamespaceId(masterBranchId, n.id);
        if (!isMasterBranch) {
          // 由于分支不是主分支，可能存在分支上独立的key或者master分支修改过的key，需要对比
          let branchKeyList = await this.keyService.getKeyWithBranchIdAndNamespaceId(branchId, n.id);
          if (branchKeyList !== null && branchKeyList.length > 0){
            for (let k=0;k<masterKeyList.length;k++){
              const masterKey = masterKeyList[k];
              let branchKeyExist = false;
              for (let l=0;l<branchKeyList.length;l++){
                const branchKey = branchKeyList[l];
                if (branchKey.actualId === masterKey.actualId){
                  branchKeyExist = true;
                  branchKeyList.splice(l,1);
                  keyList.push(branchKey);
                  break;
                }
              }
              if (!branchKeyExist){
                keyList.push(masterKey);
              }
            }
            if (branchKeyList.length > 0){
              keyList.push(branchKeyList);
            }
          } else {
            keyList = masterKeyList;
          }
        } else {
          keyList = masterKeyList;
        }
        const keyIdList = [];
        keyList.map(key => keyIdList.push(key.id));
        namespaceVO.translatedKeys = await this.keyValueRepository.count({keyId:In(keyIdList),languageId:p.languageId,latest:true});
        // 根据获取的keylist 找对应value
        namespaceVO.id = n.id;
        namespaceVO.name = n.name;
        namespaceVO.totalKeys = keyList.length;
        totalKeys += namespaceVO.totalKeys;
        totalTranferKeys += namespaceVO.translatedKeys;
        namespaceVOList.push(namespaceVO);
      }
      vo.namespaceList = namespaceVOList;
      vo.totalKeys = totalKeys;
      vo.translatedKeys = totalTranferKeys;
      result.push(vo);
    }
    return result;
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
}
