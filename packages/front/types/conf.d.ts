interface IConf {
  ip: string;
}

declare namespace NodeJS {
  export interface Process {
    conf: IConf;
  }
}
