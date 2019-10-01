import { Module } from '@nestjs/common';
import { LoggedGuard } from './logged.guard';
import { LoggedOrNotGuard } from './logged-or-not.guard';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';
import { WsLoggedGuard } from '@app/shared/guards/ws-logged.guard';
import { WsLoggedOrNotGuard } from '@app/shared/guards/ws-logged-or-not.guard';

@Module({
  imports: [
    JwtTokenModule,
  ],
  providers: [
    LoggedGuard,
    LoggedOrNotGuard,
    WsLoggedGuard,
    WsLoggedOrNotGuard,
    WsLoggedOrNotGuard,
  ],
  exports: [JwtTokenModule],
})
export class GuardsModule {}
