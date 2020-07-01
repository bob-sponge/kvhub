import { NamespaceVO } from './NamespaceVO';

export class ProjectViewVO {
  id: number;
  languageName: string;
  languageId:number;
  modifier: string;
  time: string;
  translatedKeys: number;
  totalKeys: number;
  namespaceList: NamespaceVO[];
}
