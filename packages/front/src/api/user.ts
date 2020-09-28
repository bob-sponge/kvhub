import { ajax } from '@ofm/ajax';

const prefix = '/user';
const getUserAddress = `${prefix}/query`;
const resetPwdAddress = `${prefix}/reset`;
const delUserAddress = `${prefix}/delete`;
const setRoleAddress = `${prefix}/set`;
const getUerProfileAddress = `${prefix}/query`;
const resetOneUserPwdAddress = `${prefix}/reset/oneuser`;

export const getUserApi = (params: any) => ajax.post(getUserAddress, params);

export const resetPwdApi = (params: any) => ajax.post(resetPwdAddress, params);

export const delUserApi = (id: any) => ajax.delete(`${delUserAddress}/${id}`);

export const setRoleApi = (id: any, level: any) => ajax.get(`${setRoleAddress}/${id}/${level}`);

export const getUserInfoApi = (id: any) => ajax.get(`${getUerProfileAddress}/${id}`);

export const resetOnePwdApi = (params: any) => ajax.post(resetOneUserPwdAddress, params);
