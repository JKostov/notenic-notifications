import { Module } from '@nestjs/common';
import { SharedModule } from '@app/shared/shared.module';
import { NotificationModule } from './notification/notification.module';
import { DatabaseModule } from './database/database.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    SharedModule,
    DatabaseModule,
    NotificationModule,
    GatewaysModule,
  ],
})
export class NotificationsModule {}
