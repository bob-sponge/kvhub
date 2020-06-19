import { ajax } from '@ofm/ajax';

const prefix = '/branchMerge';

/**
 * 获取Merge Request List
 * */
export const branchMergeListApi = (detail: any) => ajax.post(`${prefix}/list`, detail);

/**
 * save branchMerge
 * */
export const branchMergeSaveApi = (detail: any) => ajax.post(`${prefix}/save`, detail);

/**
 * 获取Merge Request 详情页
 * */
export const branchMergeInfoApi = (branchMergeId: any) => ajax.get(`${prefix}/info/${branchMergeId}`);

/**
 * refuse Merge Request
 * */
export const branchMergeRefuseApi = (branchMergeId: any) => ajax.get(`${prefix}/refuse/${branchMergeId}`);
