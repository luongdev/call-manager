import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { RawData, WebSocket } from 'ws';
import { createReadStream, createWriteStream, WriteStream } from 'node:fs';
import { Reader } from 'wav';

@WebSocketGateway(3006)
export class WsGateway implements OnGatewayInit, OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {
  private streams = new Map<string, WriteStream>();

  afterInit(): any {
    // console.log(`Server after init `, server);
  }


  handleConnection(client: WebSocket, ...args: any[]): any {
    client.on('message', (message: RawData, binary) => {
      if (!binary) {
        const metadata = JSON.parse(message.toString());
        client['uuid'] = metadata['id']
        this.streams[client['uuid']] = createWriteStream(`audio/received_customer_audio.wav`);

        return;
      }

      this.streams[client['uuid']].write(message);
      // console.log(`Received RTP from customer `);
    })


    const reader = new Reader();
    const readerStream = createReadStream(`audio/fake_bot_stream.wav`);
    readerStream.pipe(reader);

    reader.on('format', (format) => {
      const samplesPerChunk = 1024;
      const timePerChunk = (samplesPerChunk / format.sampleRate) * 1000;

      reader.on('data', (data) => {
        client.send(data);
        // console.log(`BOT sent RTP to customer`);
        reader.pause();

        setTimeout(() => {
          reader.resume();
        }, timePerChunk);
      });

    });
  }

  handleDisconnect(client: WebSocket): any {
    console.log(`On client disconnect `, client['uuid']);

    this.streams[client['uuid']]?.close();
  }
}
