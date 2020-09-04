import { ajax } from '@ofm/ajax';

const loginAddress = '/user/login';

export const loginApi = () => ajax.get(loginAddress);
