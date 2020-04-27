import { Page } from "./Page";
import { Branch } from "src/entities/Branch";

/**
 * 返回前端分页参数
 */
export class PageResult extends Page {
  data: Branch[];
  total: number;
}