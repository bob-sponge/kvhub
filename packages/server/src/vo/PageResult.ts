import { Page } from './Page';
import { BranchVO } from './BranchVO';

/**
 * 返回前端分页参数
 */
export class PageResult extends Page {
  data: BranchVO[];
  total: number;
}
