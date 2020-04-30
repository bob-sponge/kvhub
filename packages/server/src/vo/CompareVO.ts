import { IsInt } from "class-validator";

export class CompareVO {
  @IsInt()
  branchIdOne: number;
  @IsInt()
  branchIdTwo: number;
}