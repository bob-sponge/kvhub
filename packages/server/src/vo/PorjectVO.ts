import { IsNotEmpty, IsString, IsInt } from 'class-validator';
export class ProjectVO {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsInt()
  referenceId: number;
}
