import { IsInt } from 'class-validator';

export class CompareVO {
  @IsInt()
  source: number;
  @IsInt()
  destination: number;
}
