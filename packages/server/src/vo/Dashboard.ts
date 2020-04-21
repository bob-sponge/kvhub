export class Dashboard {
  // project_id
  id: number;
  // project_name
  name: string;
  // project下所有的语言
  languages: string[];
  modifier: string;
  time: string;
  // 已翻译的key数量
  translatedKeysNumber: number;
  // 已翻译的key
  translatedKeys: number[];
  // project下所有的key的数量
  KeysNumber: number;
  // project下所有的key
  keys: number[];
}
