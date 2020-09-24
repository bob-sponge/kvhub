import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class BranchBody {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  projectId: number;

  branchId:number;

  user:string;
}
