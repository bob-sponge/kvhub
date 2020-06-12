export class ResponseBody {
  statusCode: number;
  // 返回值或message
  data: any;
  success: boolean;
  timestamp: number;

  constructor(statusCode: number, data: any, success: boolean, timestamp: number) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = success;
    this.timestamp = timestamp;
  }
  static getTime(): number {
    return new Date().valueOf();
  }

  static ok() {
    return new ResponseBody(0, 'request success', true, ResponseBody.getTime());
  }

  static okWithData(data: any) {
    return new ResponseBody(0, data, true, ResponseBody.getTime());
  }

  static okWithMsg(message: string) {
    return ResponseBody.okWithData(message);
  }

  static error(message: string, statusCode: number) {
    return new ResponseBody(statusCode, message, false, ResponseBody.getTime());
  }
}
