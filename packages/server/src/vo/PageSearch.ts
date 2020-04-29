import { Page } from './Page';
import { IsString } from 'class-validator';

export class PageSearch extends Page {
  @IsString()
  content: string;
}
