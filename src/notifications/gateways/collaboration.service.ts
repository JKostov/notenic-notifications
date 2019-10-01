import { Injectable } from '@nestjs/common';

@Injectable()
export class CollaborationService {
  private activeInRoom: { [key: string]: string[] } = {};

  public addUserInRoom(room: string, user: string): void {
    if (!this.activeInRoom[room]) {
      this.activeInRoom[room] = [];
    }
    this.activeInRoom[room].push(user);
  }

  public removeUserFromRoom(room: string, user: string): string {
    if (!this.activeInRoom[room]) {
      return null;
    }
    this.activeInRoom[room] = this.activeInRoom[room].filter(u => u !== user);
    return room;
  }

  public removeUserFromAllRooms(user: string): string[] {
    const keys = Object.keys(this.activeInRoom);
    const removedRooms = keys.map(k => this.removeUserFromRoom(k, user));
    return removedRooms.filter(r => r !== null);
  }

  public getActiveUsersForRoom(room: string): string[] {
    return this.activeInRoom[room];
  }

  public checkUserInRoom(room: string, user: string): boolean {
    const users = this.activeInRoom[room];
    const u = users.find(usr => user === user);

    return !!u;
  }
}
