import { ajax } from '@ofm/ajax';

const addProjectAddress = '/project/dashboard/save';
const projectAllListAddress = '/project/dashboard/all';
const languagesAddress = '/languages/all';
const projectDetailAddress = '/project/view';

export const addProjectApi = (params: any) => ajax.post(addProjectAddress, params);

export const projectAllListApi = () => ajax.get(projectAllListAddress);

export const languagesApi = () => ajax.get(languagesAddress);

export const projectDetailApi = (id: any) => ajax.get(`${projectDetailAddress}/${id}`);
