import { FreeSwitchClientLogger, FreeSwitchResponse, StringMap } from 'esl';
import { LoggerService } from '@logger/logger.service';

export type ESLSocket = FreeSwitchResponse;

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

export interface SocketStore {
    set(key: string, socket: ESLSocket, onClose?: () => void): void;
    getOrDefault(key: string): ESLSocket;
    close(key: string): void;
    clear(): void;
}

export const SocketStore = Symbol('SocketStore');

export class Logger implements FreeSwitchClientLogger {
  constructor(private readonly _log: LoggerService, private readonly _debug = false) {
  }

  debug(msg: string, data: unknown): void {
    if (this._debug) {
      return this._log?.debug(`${msg}`, data);
    }
  }

  error(msg: string, data: unknown): void {
    const error = data?.['error'];

    return this._log?.error(`${msg}. Reply: {}`, error, data);
  }

  info(msg: string, data: unknown): void {
    return this._log?.log(msg, data);
  }

}

export function isOk(response?: { headers: Record<string, string | undefined> }): boolean {
  return response?.headers?.['Reply-Text'] !== '-ERR';
}
