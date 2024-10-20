import { ESLSocket, SocketStore } from '../freeswitch.type';

export class ChannelSocketStore implements SocketStore {

  private readonly _sockets = new Map<string, ESLSocket>();

  constructor() {
  }

  clear() {
    this._sockets.clear();
  }

  close(key: string): void {
    const socket = this._sockets.get(key);
    if (socket) {
      socket.end();
      this._sockets.delete(key);
    }
  }

  getOrDefault(key: string): ESLSocket {
    return this._sockets.get(key) ?? this._sockets.get('inbound');
  }

  set(key: string, socket: ESLSocket, onClose?: () => void): void {
    this._sockets.set(key, socket);
    if (!socket.closed) {
      (socket as any).once('socket.close', () => {
        this._sockets.delete(key);
        onClose?.();
      });
    }
  }

}
