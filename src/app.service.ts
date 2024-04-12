import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as console from 'console';

@Injectable()
export class AppService implements OnApplicationBootstrap{
  getHello(): string {
    const arr = [1, 2, 3];
    console.log(arr)

    return 'Hello World!';
  }

  onApplicationBootstrap() {
  }
}
