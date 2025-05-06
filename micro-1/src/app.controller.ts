import {
  Controller,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  private apiMaps = null;

  constructor(private readonly appService: AppService) {
    this.initApiMap();
  }

  private initApiMap() {
    if (!this.apiMaps) {
      this.apiMaps = {
        '/api/v1/login': (data) => this.appService.processLogin(data),
        '/api/v1/register': (data) => this.appService.processAny(data),
      };
    }
  }

  @MessagePattern('micro1')
  requestHandler(@Payload() message: any, @Ctx() context: KafkaContext) {
    if (message == null)
      return Promise.reject(new InternalServerErrorException());
    this.logger.log(
      `handle message: ${JSON.stringify(message)}, msg context: ${JSON.stringify(context.getMessage())}`,
    );
    const func = this.apiMaps[message.uri];
    if (func != null) {
      return func(message.data, message);
    }
    return false;
  }
}
