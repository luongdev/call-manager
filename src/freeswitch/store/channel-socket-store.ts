import { ESLSocket, SocketStore } from '../freeswitch.type';
import { FreeswitchService } from '../freeswitch.service';

export class ChannelSocketStore implements SocketStore {

  private readonly _sockets = new Map<string, ESLSocket>();

  constructor(private readonly _client: FreeswitchService) {
    if (this._client?.socket) {
      this._sockets.set('inbound', this._client.socket)
    }
  }

  clear() {
    this._sockets.clear();
    this._sockets.set('inbound', this._client.socket)
  }

  close(key: string): void {
    const socket = this._sockets.get(key);
    if (socket) {
      socket.end();
      this._sockets.delete(key);
    }
  }

  getOrDefault(key: string): ESLSocket {
    return this._sockets.get(key) ?? this._client.socket;
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
