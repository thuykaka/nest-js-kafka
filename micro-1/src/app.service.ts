import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { catchError, lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject('KAFKA_PRODUCER') private producer: ClientKafka) {}

  async onModuleInit() {
    // Bắt buộc phải subscrible vào thì mới nhận đc response
    this.producer.subscribeToResponseOf('micro2');
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.close();
  }

  private send(topic: string, payload: any, _timeout = 5000) {
    return this.producer.send(topic, payload).pipe(
      timeout(_timeout),
      catchError((e) => {
        this.logger.error(e);
        throw new HttpException('REQUEST_TIMEOUT', HttpStatus.REQUEST_TIMEOUT);
      }),
    );
  }

  getHello(): string {
    return 'Hello World!';
  }

  async processLogin(data) {
    this.logger.log('processLogin');
    let extra;
    try {
      extra = await lastValueFrom(
        this.send('micro2', {
          uri: '/api/v1/getExtraInfo',
          data: { xx: 'yy' },
        }),
      );
      this.logger.log(`extra: ${JSON.stringify(extra)}`);
    } catch (e) {
      this.logger.error(e);
      extra = {};
    }
    return { processLogin: data, pid: process.pid, extra };
  }

  processAny(data) {
    return { processAny: data };
  }
}
