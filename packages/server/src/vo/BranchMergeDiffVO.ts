import { MergeDiffKey } from 'src/entities/MergeDiffKey';
import { MergeDiffShowVO } from './MergeDiffShowVO';

export class BranchMergeDiffVO {
  mergeDiffKey: MergeDiffKey;
  keyActualId: number;
  source: MergeDiffShowVO;
  target: MergeDiffShowVO;
}
