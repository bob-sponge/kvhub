import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class ProjectVO {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNumber()
  referenceId: number;
}
