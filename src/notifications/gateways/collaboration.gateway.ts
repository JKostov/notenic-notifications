import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException,
} from '@nestjs/websockets';
import { Client, Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';
import { LoggedGuard } from '@app/shared/guards/logged.guard';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway({ namespace: 'collaboration' })
export class CollaborationGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  activeInRoom: { [key: string]: string[] } = {};

  constructor(@Inject('SERVICES_CLIENT') private readonly client: ClientProxy) { }

  handleDisconnect(socket: Socket): void {
    const user = (socket as any).user;
    if (!user) {
      return;
    }

    const rooms = this.removeUserFromAllRooms(user.id);

    rooms.forEach(room => {
      socket.to(room).emit('left', user.id);
    });
  }

  @UseGuards(LoggedGuard)
  @SubscribeMessage('message')
  handleMessage(client: Client, payload: any): string {
    return 'Hello world!';
  }

  @UseGuards(LoggedGuard)
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
    this.addUserInRoom(room, user.id);

    socket.to(room).emit('joined', user.id);
    return this.getActiveUsersForRoom(room);
  }

  @UseGuards(LoggedGuard)
  @SubscribeMessage('leave-room')
  leaveRoom(socket: Socket, room: string): void {
    const user = (socket as any).user;

    socket.leave(room);
    this.removeUserFromRoom(room, user.id);

    socket.to(room).emit('left', user.id);
  }

  @UseGuards(LoggedGuard)
  @SubscribeMessage('update')
  update(socket: Socket, collaborationUpdate: { id: string, update: string }): void {
    const user = (socket as any).user;
    const room = collaborationUpdate.id;

    const res = this.checkUserInRoom(room, user.id);
    if (!res) {
      throw new WsException('Forbidden');
    }

    socket.to(room).emit('update-collaboration', collaborationUpdate.update);
  }

  @UseGuards(LoggedGuard)
  @SubscribeMessage('merge')
  merge(socket: Socket, collaborationUpdate: { id: string, update: any }): void {
    const user = (socket as any).user;
    const room = collaborationUpdate.id;

    const res = this.checkUserInRoom(room, user.id);
    if (!res) {
      throw new WsException('Forbidden');
    }

    socket.to(room).emit('merge-collaboration', collaborationUpdate.update);
  }

  private addUserInRoom(room: string, user: string): void {
    if (!this.activeInRoom[room]) {
      this.activeInRoom[room] = [];
    }
    this.activeInRoom[room].push(user);
  }

  private removeUserFromRoom(room: string, user: string): string {
    if (!this.activeInRoom[room]) {
      return null;
    }
    this.activeInRoom[room] = this.activeInRoom[room].filter(u => u !== user);
    return room;
  }

  private removeUserFromAllRooms(user: string): string[] {
    const keys = Object.keys(this.activeInRoom);
    const removedRooms = keys.map(k => this.removeUserFromRoom(k, user));
    return removedRooms.filter(r => r !== null);
  }

  private getActiveUsersForRoom(room: string): string[] {
    return this.activeInRoom[room];
  }

  private checkUserInRoom(room: string, user: string): boolean {
    const users = this.activeInRoom[room];
    const u = users.find(usr => user === user);

    return !!u;
  }
}
