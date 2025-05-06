import { NestFactory } from '@nestjs/core';
import { nanoid } from 'nanoid';
import {
  KafkaOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Phần này tạo server, ý nói rằng tao là server nhận phản hồi, xử lý và trả lại cho các thằng client
  const kafkaConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `micro2_${nanoid()}`, // uniquee
        brokers: ['10.0.46.12:9092'],
      },
      producer: {
        allowAutoTopicCreation: true, // cho phép tạo topic mới khi gửi hay không
      },
      consumer: {
        groupId: 'micro2',
        sessionTimeout: 6000,
        // Chung 1 group thì sẽ nhận dc msg luân phiên, nếu khác group thì khi nào cũng nhập dc
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    kafkaConfig,
  );

  await app.listen();
  console.log(`config: ${JSON.stringify(kafkaConfig)}`);
  console.log(`service started !!!`);
}

bootstrap();
