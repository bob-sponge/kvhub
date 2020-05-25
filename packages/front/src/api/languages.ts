import { ajax } from '@ofm/ajax';

const projectView = '/project/view';

export const projectViewApi = ({ pid, id }: any) => ajax.get(`${projectView}/${pid}/${id}`);
