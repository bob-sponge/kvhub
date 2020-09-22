/**
 * common constant
 */

export class CommonConstant {
  /* merge type
   * 0:created
   * 1:merged
   * 2:refused
   * 3:merging
   */
  static MERGE_TYPE_CREATED = '0';
  static MERGE_TYPE_MERGED = '1';
  static MERGE_TYPE_REFUSED = '2';
  static MERGE_TYPE_MERGING = '3';
  static MERGE_TYPE_FAILED = '4';

  /* commit type
   * 0:add key
   * 1:change value
   * 2:rename key
   * 3:merge request
   */
  static COMMIT_TYPE_ADD = '0';
  static COMMIT_TYPE_CHANGE = '1';
  static COMMIT_TYPE_RENAME = '2';
  static COMMIT_TYPE_MERGE = '3';

  static STRING_BLANK = '';
}

export class ErrorMessage {
  // branch
  static BRANCH_ID_IS_ILLEGAL = 'Branch id is illegal!';
  static BRANCH_NOT_EXIST = 'Branch is not exist!';
  static BRANCH_NOT_CHOOSE = 'Branch can not be null!';
  static BRANCH_NOT_SAME = 'Branch can not be the same!';
  static BRANCH_NAME_DUPLICATE = 'Branch name is duplicate!';
  static BRANCH_IS_MERGING = 'Branch is merging!';

  // branch merge
  static BRANCH_MERGE_NOT_EXIST = 'Branch merge is not exist!';
  static BRANCH_MERGE_IS_NOT_CREATED = 'Branch merge has been merged or refused or is merging!';
  static BRANCH_MERGE_DIFF_KEY_NOT_CHOOSE = 'Branch merge diff key can not be empty!';
  static BRANCH_MERGE_DIFF_KEY_NOT_SELECT_ALL = 'Please confirm all ths branch merge diff keys are selected!';

  // key
  static KEY_NOT_EXIST = 'Key is not exist!';
  // value
  static VALUE_CHANGED = 'Value is changed!';

  // project
  static PROJECT_NOT_EXIST = 'Project is not exist or has deleted!';

  // user
  static PLEASE_LOGIN_FIRST = 'Please Login First!';
  static USER_NOT_EXIST = 'Logged In User Not Exist!';
  static OLD_PASSWORD_ERROR = 'Old Password Error!';
  static RESET_PASSWORD_SUCCESS = 'Reset Password Success!';
  static DELETE_USER_SUCCESS = 'Delete User Success!';
  static SET_AS_ADMIN_SUCCESS = 'Set As Admin Success!';
  static SET_AS_GENERAL_SUCCESS = 'Set As General Success!';
  static PAGE_PARAM_ERROR = 'Page Param Error!';
  static NO_PERMISSION = 'No Permission!';
  static MUST_ADMIN = 'Only Administrator Can Modify!';
  static VALUE_NOT_BLANK = 'value is not blank!';
  static USER_OR_PASSWORD_IS_WRONG = 'Username or password is wrong!';
  static USER_NOT_EXIST_IN_DB = 'User not exist!';
}
