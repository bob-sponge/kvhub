import { ajax } from '@ofm/ajax';
import * as RequestType from '../modules/namespace/constant';

/**
 * 获取命名空间所有语言
 */
export const getLanguages = (namespaceId: number) => ajax.get(`/namespace/view/${namespaceId}/languages`);
/**
 * 根据namespaceId, languageId,KeyTranslateProgressStatus(all, unfinished, finished)查询key
 */
export const getKeys = (data: RequestType.ConditionReq) => ajax.post('/namespace/view/keys', data);
/**
 * 修改 key 的 value
 */
export const modifyValue = (languageId: number, keyId: number, data: RequestType.ModifyKeyReq) =>
  ajax.post(`/namespace/view/language/${languageId}/key/${keyId}`, data);
/**
 * 删除 key
 */
export const deleteKey = (keyId: number) => ajax.delete(`/namespace/view/key/${keyId}`);
