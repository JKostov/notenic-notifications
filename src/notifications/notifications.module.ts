import { Module } from '@nestjs/common';
import { TestGateway } from './gateways/test.gateway';

@Module({
  providers: [TestGateway]
})
export class NotificationsModule {}
