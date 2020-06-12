import { ajax } from '@ofm/ajax';

const addProjectAddress = '/project/dashboard/save';
const projectAllListAddress = '/project/dashboard/all';
const languagesAddress = '/languages/all';

export const addProjectApi = (params: any) => ajax.post(addProjectAddress, params);

export const projectAllListApi = () => ajax.get(projectAllListAddress);

export const languagesApi = () => ajax.get(languagesAddress);
