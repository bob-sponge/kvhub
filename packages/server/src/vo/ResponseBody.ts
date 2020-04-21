export class ResponseBody {
  code: number;
  data: any;
  message: string;

  constructor(code: number, data: any, message: string) {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static ok() {
    return new ResponseBody(0, null, 'success');
  }

  static okWithData(data: any) {
    return new ResponseBody(0, data, 'success');
  }

  static okWithMsg(message: string) {
    return new ResponseBody(0, null, message);
  }
}
