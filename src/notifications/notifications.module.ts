import { Module } from '@nestjs/common';
import { CollaborationGateway } from './gateways/collaboration.gateway';
import { SharedModule } from '@app/shared/shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [CollaborationGateway],
})
export class NotificationsModule {}
