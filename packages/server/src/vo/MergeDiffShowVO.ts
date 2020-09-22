import { MergeDiffValueShowVO } from './MergeDiffValueShowVo';

export class MergeDiffShowVO {
  keyId: number;
  keyNameId: number;
  keyname: string;
  branchId: number;
  namespaceId: number;
  namespaceName: string;
  valueList: MergeDiffValueShowVO[];
}
