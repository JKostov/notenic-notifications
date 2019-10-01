import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { Token } from '@app/shared/jwt-token/token.interface';

@Injectable()
export class WsLoggedGuard implements CanActivate {
  constructor(private readonly tokenService: JwtTokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const cookies: string[] = client.handshake.headers.cookie.split('; ');
    const token = cookies.find(cookie => cookie.startsWith('AUTH_TOKEN')).split('=')[1];

    if (!token) {
      return false;
    }

    const tokenData: Token = await this.tokenService.verifyTokenAndGetData(token);

    if (!tokenData) {
      return false;
    }

    client.user = tokenData;
    return true;
  }
}
