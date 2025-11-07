export interface ISuccessResponse<T, E = unknown> {
  statusCode: number;
  statusText: EStatusText;
  message: string;
  data: T;
  extra?: E;
}

interface IError {
  message: string;
}
export interface IErrorResponse {
  statusCode: number;
  statusText: EStatusText;
  message: string;
  path: string;
  timestamp: string;
  error?: IError[];
}

export enum EStatusText {
  SUCCESS = 'Success',
  FAIL = 'Failed',
  ERROR = 'Error',
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}
