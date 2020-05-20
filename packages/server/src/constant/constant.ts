/**
 * common constant
 */

export class CommonConstant {
  static MERGE_TYPE_CREATED = '0';
  static MERGE_TYPE_MERGED = '1';
  static MERGE_TYPE_REFUSED = '2';
}

export class ErrorMessage {
  static BRANCH_NOT_EXIST = 'Branch is not exist!';
  static BRANCH_NOT_CHOOSE = 'Branch can not be null!';
  static BRANCH_NOT_SAME = 'Branch can not be the same!';
  static BRANCH_IS_MERGING = 'Branch is merging!';
  static BRANCH_MERGE_NOT_EXIST = 'Branch merge is not exist!';
  static BRANCH_MERGE_IS_NOT_CREATED = 'Branch merge has been merged or refused!';
}
