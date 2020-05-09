import { ajax } from '@ofm/ajax';

const addProjectAddress = '/a/b/c';

export const addProjectApi = (params: any) => ajax.post(addProjectAddress, params);