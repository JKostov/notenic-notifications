import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsLoggedGuard } from '@app/shared/guards/ws-logged.guard';

@WebSocketGateway({ namespace: 'notifications' })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(WsLoggedGuard)
  @SubscribeMessage('join-room')
  async joinRoom(socket: Socket): Promise<void> {
    const user = (socket as any).user;

    socket.join(user.id);
  }
}
