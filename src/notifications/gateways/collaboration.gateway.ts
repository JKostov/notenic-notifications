import {
  OnGatewayDisconnect,
  SubscribeMessage, WebSocketGateway,
  WebSocketServer, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WsLoggedGuard } from '@app/shared/guards/ws-logged.guard';
import { CollaborationService } from '@notifications//gateways/collaboration.service';

@WebSocketGateway({ namespace: 'collaboration' })
export class CollaborationGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject('SERVICES_CLIENT') private readonly client: ClientProxy,
              private readonly collaborationService: CollaborationService) { }

  handleDisconnect(socket: Socket): void {
    const user = (socket as any).user;
    if (!user) {
      return;
    }

    const rooms = this.collaborationService.removeUserFromAllRooms(user.id);

    rooms.forEach(room => {
      socket.to(room).emit('left', user.id);
    });
  }

  @UseGuards(WsLoggedGuard)
  @SubscribeMessage('join-room')
  async joinRoom(socket: Socket, room: string): Promise<string[]> {
    const user = (socket as any).user;

    const pattern = { cmd: 'checkUserCollaboration' };
    const payload = {
      user,
      collaborationId: room,
    };
    const res = await this.client.send<boolean>(pattern, payload).pipe().toPromise();
    if (!res) {
      console.log('ERROR!');
      throw new WsException('Forbidden');
    }

    socket.join(room);
    this.collaborationService.addUserInRoom(room, user.id);

    socket.to(room).emit('joined', user.id);
    return this.collaborationService.getActiveUsersForRoom(room);
  }

  @UseGuards(WsLoggedGuard)
  @SubscribeMessage('leave-room')
  leaveRoom(socket: Socket, room: string): void {
    const user = (socket as any).user;

    socket.leave(room);
    this.collaborationService.removeUserFromRoom(room, user.id);

    socket.to(room).emit('left', user.id);
  }

  @UseGuards(WsLoggedGuard)
  @SubscribeMessage('update')
  update(socket: Socket, collaborationUpdate: { id: string, update: string }): void {
    const user = (socket as any).user;
    const room = collaborationUpdate.id;

    const res = this.collaborationService.checkUserInRoom(room, user.id);
    if (!res) {
      throw new WsException('Forbidden');
    }

    socket.to(room).emit('update-collaboration', collaborationUpdate.update);
  }

  @UseGuards(WsLoggedGuard)
  @SubscribeMessage('merge')
  merge(socket: Socket, collaborationUpdate: { id: string, update: any }): void {
    const user = (socket as any).user;
    const room = collaborationUpdate.id;

    const res = this.collaborationService.checkUserInRoom(room, user.id);
    if (!res) {
      throw new WsException('Forbidden');
    }

    socket.to(room).emit('merge-collaboration', collaborationUpdate.update);
  }
}
