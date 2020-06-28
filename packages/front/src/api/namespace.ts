import { ajax } from '@ofm/ajax';
import * as RequestType from '../modules/namespace/constant';

/**
 * 获取命名空间所有语言
 */
export const getLanguages = (namespaceId: number) => ajax.get(`/namespace/view/${namespaceId}/languages`);
/**
 * 获取项目下所有分支
 * */
export const branchList = (projectId: number) => ajax.get(`/branch/list/${projectId}`);
/**
 * 根据namespaceId, languageId,KeyTranslateProgressStatus(all, unfinished, finished)查询key
 */
export const getKeys = (data: RequestType.ConditionReq) => ajax.post('/namespace/view/keys', data);
/**
 * 修改 key 的 value
 */
export const modifyValue = (branchId: number, languageId: number, keyId: number, data: RequestType.ModifyKeyReq) =>
  ajax.post(`/namespace/view/branch/${branchId}/language/${languageId}/key/${keyId}`, data);
/**
 * 删除 key
 */
export const deleteKey = (keyId: number) => ajax.delete(`/namespace/view/key/${keyId}`);
/**
 * 修改 key 的name
 */
export const modifyKeyname = (data: RequestType.KeyName) => ajax.post('/namespace/view/keyname', data);
/**
 * 获取Key的所有语言
 */
export const getLanguagesByKeyId = (keyId: number) => ajax.get(`/namespace/view/keyId/${keyId}`);
/**
 * 增加或者编辑 key value
 */
export const addOrEditKeyValue = (data: any) => ajax.post('/namespace/view/keyvalue', data);
/**
 * 删除 namespace
 */
export const deleteNamespace = (namespaceId: number) => ajax.post(`/namespace/view/${namespaceId}`);
