import {NamespaceVO} from "./NamespaceVO";

export class ProjectViewVO {
    id: number;
    languageName: string;
    modifier: string;
    time: string;
    translatedKeys: number;
    totalKeys: number;
    namespaceList:NamespaceVO[];
  }
  