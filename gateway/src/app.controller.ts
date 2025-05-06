import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  Req,
} from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { nanoid } from 'nanoid';
import { catchError, timeout } from 'rxjs';

@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppController.name);

  constructor(@Inject('KAFKA_PRODUCER') private producer: ClientKafka) {}

  async onModuleInit() {
    // Bắt buộc phải subscrible vào thì mới nhận đc response
    this.producer.subscribeToResponseOf('micro1');
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

  private emit(topic: string, payload: any) {
    return this.producer.emit(topic, payload);
  }

  @Get('/login/:randomId')
  handleLoginReq(@Param('randomId') randomId: string) {
    const uri = '/api/v1/login';
    const payload = { randomId: randomId || nanoid() };
    return this.send('micro1', { uri, data: payload });
  }
}
