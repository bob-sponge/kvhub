export class SelectedKeyDTO {
  keyId: number;
  keyNameId: number;
  keyName: string;
  valueList: SelectedValueDTO[];
}

export class SelectedValueDTO {
  valueId: number;
  value: string;
  languageId: number;
}
