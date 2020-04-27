import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class BranchVO {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  projectId: number;
}
