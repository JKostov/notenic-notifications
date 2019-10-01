import { Module } from '@nestjs/common';
import { NotificationGateway } from '@notifications/gateways/notification.gateway';
import { CollaborationGateway } from '@notifications/gateways/collaboration.gateway';
import { CollaborationService } from '@notifications/gateways/collaboration.service';
import { SharedModule } from '@app/shared/shared.module';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [
    CollaborationService,
    CollaborationGateway,
    NotificationGateway,
  ],
  exports: [
    CollaborationGateway,
    NotificationGateway,
  ],
})
export class GatewaysModule {}
