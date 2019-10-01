import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtTokenService } from '../jwt-token/jwt-token.service';

@Injectable()
export class WsLoggedOrNotGuard implements CanActivate {
  constructor(private readonly tokenService: JwtTokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const cookies: string[] = client.handshake.headers.cookie.split('; ');
    const token = cookies.find(cookie => cookie.startsWith('AUTH_TOKEN')).split('=')[1];

    if (token) {
      client.user = await this.tokenService.verifyTokenAndGetData(token);
    }

    return true;
  }
}
