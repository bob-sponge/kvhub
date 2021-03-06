import { ajax } from '@ofm/ajax';

/**
 * 获取Languages List
 * */
export const projectViewApi = ({ pid, id }: any) => ajax.get(`/project/view/${pid}/${id}`);

/**
 * 获取项目下所有分支
 * */
export const branchListApi = (projectId: string) => ajax.get(`/branch/list/${projectId}`);

/**
 * 新增 namespace   "name":"test1","projectId":1,"type":"private"
 * */
export const namespaceSaveApi = (detail: any) => ajax.post('/namespace/save', detail);

/**
 * 删除 language
 * */
export const projectLanguageDeleteApi = (id: string) => ajax.get(`/projectLanguage/delete/${id}`);

/**
 * 新增 language
 * */
export const projectLanguageSaveApi = (detail: any) => ajax.post('/projectLanguage/save', detail);

/**
 * 获取默认语言列表
 * */
export const languagesAllApi = () => ajax.get('/languages/all');
