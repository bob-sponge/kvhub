import { IsNotEmpty, IsNumber } from 'class-validator';
export class ProjectVO {
  @IsNotEmpty()
  name: string;
  @IsNumber()
  referenceId: number;
}
