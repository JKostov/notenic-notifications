import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(3002)
export class TestGateway implements OnGatewayConnection {

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECT');
    console.log(client);
    console.log(args);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log('aubasdulkgbasdf');
    console.log(client);
    console.log(payload);
    return 'Hello world!';
  }
}
