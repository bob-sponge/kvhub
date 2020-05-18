import { ajax } from '@ofm/ajax';

const projectView = 'http://10.192.30.203:5000/project/view';

export const projectViewApi = ({ pid, id }: any) => ajax.get(`${projectView}/${pid}/${id}`);
