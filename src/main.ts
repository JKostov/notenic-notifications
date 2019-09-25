import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NotenicLoggerService } from '@app/shared/logger/notenic-logger.service';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const micro = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: {
      url: 'nats://notenic-nats:4222',
    },
  });

  micro.useLogger(micro.get(NotenicLoggerService));
  micro.useGlobalPipes(new ValidationPipe());

  micro.listen(() => console.log('Connected to nats.'));
}
bootstrap();
