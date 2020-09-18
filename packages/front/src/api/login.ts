import { ajax } from '@ofm/ajax';

const loginAddress = '/user/login';

export const loginApi = (params: any) => ajax.post(loginAddress, params);
