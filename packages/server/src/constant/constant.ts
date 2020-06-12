/**
 * common constant
 */

export class CommonConstant {
  static MERGE_TYPE_CREATED = '0';
  static MERGE_TYPE_MERGED = '1';
  static MERGE_TYPE_REFUSED = '2';
  static MERGE_TYPE_MERGING = '3';

  static COMMIT_TYPE_ADD = '0';
  static COMMIT_TYPE_CHANGE = '1';
  static COMMIT_TYPE_RENAME = '2';  
  static COMMIT_TYPE_MERGE = '3';

  static STRING_BLANK = '';
}

export class ErrorMessage {
  static BRANCH_NOT_EXIST = 'Branch is not exist!';
  static BRANCH_NOT_CHOOSE = 'Branch can not be null!';
  static BRANCH_NOT_SAME = 'Branch can not be the same!';
  static BRANCH_IS_MERGING = 'Branch is merging!';
  static BRANCH_MERGE_NOT_EXIST = 'Branch merge is not exist!';
  static BRANCH_MERGE_IS_NOT_CREATED = 'Branch merge has been merged or refused!';
  static BRANCH_MERGE_DIFF_KEY_NOT_CHOOSE = 'Branch merge diff key can not be empty!';
  static BRANCH_MERGE_DIFF_KEY_NOT_SELECT_ALL = 'Please confirm all ths branch merge diff keys are selected!';
}
