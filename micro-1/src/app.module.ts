import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ClientProxyFactory,
  KafkaOptions,
  Transport,
} from '@nestjs/microservices';
import { nanoid } from 'nanoid';

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
              clientId: `micro1-${nanoid()}`,
              brokers: ['10.0.46.12:9092'],
            },
            consumer: {
              groupId: 'micro1',
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
  ],
})
export class AppModule {}
