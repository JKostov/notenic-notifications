import { Module } from '@nestjs/common';
import { SharedModule } from '@app/shared/shared.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    SharedModule,
    NotificationsModule,
  ],
})
export class AppModule {}
