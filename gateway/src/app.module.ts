import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ClientProxyFactory,
  KafkaOptions,
  Transport,
} from '@nestjs/microservices';
import { nanoid } from 'nanoid';
import { logLevel } from '@nestjs/microservices/external/kafka.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './exception-filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: (config: ConfigService) => {
        const kafkaConfig: KafkaOptions = {
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: `rest-${nanoid()}`,
              brokers: ['10.0.46.12:9092'],
              logLevel: logLevel.INFO,
            },
            consumer: {
              groupId: 'rest',
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        };
        console.log(`config: ${JSON.stringify(kafkaConfig)}`);
        return ClientProxyFactory.create(kafkaConfig);
      },
      inject: [ConfigService],
    },
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
