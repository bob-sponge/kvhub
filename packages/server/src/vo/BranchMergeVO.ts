export class BranchMergeVO {
  id: number;
  sourceBranchId: number | null;
  sourceBranchName: string | null;
  targetBranchId: number;
  targetBranchName : string;
  crosMerge: boolean | null;
  type: string;
  commitId: string;
  modifier: string | null;
  modifyTime: Date | null;
}