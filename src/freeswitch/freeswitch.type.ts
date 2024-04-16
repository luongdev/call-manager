import { FreeSwitchClientLogger, StringMap } from 'esl';
import { LoggerService } from '@logger/logger.service';

export type SocketConnection = {
    uuid?: string;
    headers: StringMap;
    body: StringMap;
    data: StringMap;
}

export type SocketDrop = {
    localAddress?: string;
    localPort?: number;
    localFamily?: string;
    remoteAddress?: string;
    remotePort?: number;
    remoteFamily?: string;
}


export class Logger implements FreeSwitchClientLogger {
  constructor(private readonly _log: LoggerService) {
  }

  debug(msg: string, data: unknown): void {
    return this._log?.debug(`${msg}`, data);
  }

  error(msg: string, data: unknown): void {
    const error = data?.['error'];

    return this._log?.error(`${msg}. Reply: {}`, error, data);
  }

  info(msg: string, data: unknown): void {
    return this._log?.log(msg, data);
  }

}
