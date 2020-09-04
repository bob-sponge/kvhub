import { ajax } from '@ofm/ajax';

const prefix = '/user';
const getUserAddress = `${prefix}/query`;
const resetPwdAddress = `${prefix}/reset`;
const delUserAddress = `${prefix}/delete`;
const setAdminAddress = `${prefix}/admin`;

export const getUserApi = (params: any) => ajax.post(getUserAddress, params);

export const resetPwdApi = (params: any) => ajax.post(resetPwdAddress, params);

export const delUserApi = (id: any) => ajax.delete(`${delUserAddress}/${id}`);

export const setAdminApi = (id: any) => ajax.get(`${setAdminAddress}/${id}`);
