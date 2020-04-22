export class ResponseBody {
  statusCode: number;
  data: any;
  message: string;

  constructor(statusCode: number, data: any, message: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  static ok() {
    return new ResponseBody(0, true, 'success');
  }

  static okWithData(data: any) {
    return new ResponseBody(0, data, 'success');
  }

  static okWithMsg(message: string) {
    return new ResponseBody(0, true, message);
  }

  static error() {
    return new ResponseBody(-1, false, 'failure');
  }

  static errorWithMsg(message: string) {
    return new ResponseBody(-1, false, message);
  }
}
