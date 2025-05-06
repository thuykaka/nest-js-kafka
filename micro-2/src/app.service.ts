import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  processGetExtraInfo(data) {
    console.log('processGetExtraInfo');
    return { extra: data, pid: process.pid };
  }
}
