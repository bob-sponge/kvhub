import { IsNotEmpty, Min, IsInt, IsString } from "class-validator";

/**
 * 接受前端分页参数
 */
export class Page {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  page: number;
  @IsInt()
  size: number;
  @IsString()
  content: string;
}