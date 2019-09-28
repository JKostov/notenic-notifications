import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { NotenicLoggerService } from '@app/shared/logger/notenic-logger.service';
import { Transport } from '@nestjs/microservices';
import { IConfigService } from '@app/shared/config/interfaces/config.service.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: IConfigService = app.get('IConfigService');

  app.useLogger(app.get(NotenicLoggerService));
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors();
  const micro = app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      url: configService.get('NATS_URL'),
    },
  });
  micro.useLogger(micro.get(NotenicLoggerService));
  micro.useGlobalPipes(new ValidationPipe());

  micro.listen(() => console.log('Connected to nats.'));
  await app.listen(3002);
}
bootstrap();
