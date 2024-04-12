import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const arr = [1, 2, 3];
    console.log(arr)

    return 'Hello World!';
  }
}
