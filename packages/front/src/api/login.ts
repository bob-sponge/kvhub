import { ajax } from '@ofm/ajax';

const loginAddress = '/user/login';
const logoutAddress = '/user/logout';

export const loginApi = (params: any) => ajax.post(loginAddress, params);

export const logoutApi = () => ajax.get(logoutAddress);
