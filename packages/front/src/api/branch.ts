import { ajax } from '@ofm/ajax';

const prefix = '/branch';
const compareAddress = `${prefix}/compare`;
const branchListAddress = `${prefix}/list`;
const deleteBranchAddress = `${prefix}/delete`;
const createBranchAddress = `${prefix}/save`;
const branchAllAddress = `${prefix}/all`;
const createMergeAddress = '/branchMerge/save';
const createMregeRequestAddress = '/branchMerge/diffkey/generate';

// 某分支详情
export const branchDetailApi = (id: any) => ajax.get(`${prefix}/${id}`);

// 分支比较
export const branchCompareApi = (params: any) => ajax.post(compareAddress, params);

//创建merge请求
export const createMergeApi = (params: any) => ajax.post(createMergeAddress, params);

// 创建mergerequest
export const createMergeRequestApi = (id: number) => ajax.get(`${createMregeRequestAddress}/${id}`);

// 分支列表
export const branchListApi = (id: any) => ajax.get(`${branchListAddress}/${id}`);

// // 分支列表
// export const branchListApi = () => ajax.get(branchListAddress);

// 分支列表分页
export const branchAllApi = (params: any) => ajax.post(branchAllAddress, params);

// 删除分支
export const deleteBranchApi = (id: any) => ajax.delete(`${deleteBranchAddress}/${id}`);

// 新增分支
export const saveBranchApi = (params: any) => ajax.post(createBranchAddress, params);

// 获取所有项目
export const projectAllApi = () => ajax.get('/project/all');
