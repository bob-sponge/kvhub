import { IsInt, IsNotEmpty } from 'class-validator';
import { ErrorMessage } from 'src/constant/constant';

export class CompareVO {
  @IsInt({message:ErrorMessage.BRANCH_ID_IS_ILLEGAL})
  @IsNotEmpty({message:ErrorMessage.BRANCH_NOT_CHOOSE})
  source: number;
  
  @IsInt({message:ErrorMessage.BRANCH_ID_IS_ILLEGAL})
  @IsNotEmpty({message:ErrorMessage.BRANCH_NOT_CHOOSE})
  destination: number;

  crosMerge:boolean | undefined;
}
